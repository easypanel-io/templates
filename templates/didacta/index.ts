import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

/**
 * Didacta Community — plantilla de Easypanel.
 *
 * Easypanel no despliega docker-compose: la plantilla es esta función, que
 * devuelve servicios nativos del panel. Tres servicios:
 *
 *   - `app`      → la imagen de Didacta (API :4000 + web :3000 en el mismo
 *                  contenedor). Solo se publica el 3000: Next.js reescribe
 *                  `/api/*`, `/healthz` y `/readyz` al 4000 interno.
 *   - `postgres` → con imagen pgvector. NO es opcional: la migración baseline
 *                  hace `CREATE EXTENSION "vector"` y falla contra el
 *                  postgres:17 que Easypanel usa por defecto.
 *   - `redis`    → colas y caché.
 */
export function generate(input: Input): Output {
  const services: Services = [];

  // 64 caracteres sin símbolos: firma las sesiones. Rotarlo echa a todo el
  // mundo de su sesión.
  const authSecret = randomString(64);
  // Token de un solo uso del alta inicial. Viaja en una URL, así que sin
  // símbolos a propósito.
  const setupToken = randomString(32);
  const databasePassword = randomString(32);
  const redisPassword = randomString(32);

  const databaseHost = `$(PROJECT_NAME)_${input.databaseServiceName}`;
  const redisHost = `$(PROJECT_NAME)_${input.redisServiceName}`;
  const databaseName = "didacta";

  // `DIDACTA_CORE_VERSION` es la fuente de verdad de compatibilidad de módulos
  // y tiene que coincidir con el tag de la imagen. Si alguien pega una imagen
  // sin tag, se queda vacía en vez de mentir con el nombre del repositorio.
  const imageTag = input.appServiceImage.includes(":")
    ? input.appServiceImage.split(":").pop()
    : "";

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `NODE_ENV=production`,
        `DIDACTA_CORE_VERSION=${imageTag}`,
        // Base absoluta de los enlaces que salen por correo (verificación de
        // email, invitaciones, recordatorios).
        `WEB_PUBLIC_URL=https://$(PRIMARY_DOMAIN)`,
        `WEB_PUBLIC_ALLOWED_HOSTS=$(PRIMARY_DOMAIN)`,
        // Conexión de BOOTSTRAP (superusuario). Solo migraciones, RLS y
        // grants — nunca sirve tráfico. El entrypoint deriva de aquí la
        // conexión de runtime hacia el rol `didacta_app` (NOBYPASSRLS), que es
        // lo que hace real el aislamiento entre tenants. Por eso no se define
        // DATABASE_URL.
        `ADMIN_DATABASE_URL=postgresql://postgres:${databasePassword}@${databaseHost}:5432/${databaseName}?schema=public`,
        `REDIS_URL=redis://default:${redisPassword}@${redisHost}:6379`,
        `AUTH_SECRET=${authSecret}`,
        // Fijarlo evita buscar el token en los logs: el alta se hace en
        // https://<dominio>/setup?token=<este valor>.
        `DIDACTA_SETUP_TOKEN=${setupToken}`,
        // Puertos INTERNOS fijos. No tocar.
        `API_PORT=4000`,
        `WEB_PORT=3000`,
        // Almacenamiento local sobre el volumen persistente. Para S3 (AWS,
        // Hetzner, MinIO…): STORAGE_DRIVER=s3 y rellenar las S3_*.
        `STORAGE_DRIVER=local`,
        `STORAGE_ROOT=/app/data/storage`,
        // SMTP: sin esto la instalación arranca igual, avisa por la interfaz y
        // no puede mandar correos. Rellenar desde el panel tras desplegar.
        `SMTP_HOST=`,
        `SMTP_PORT=587`,
        `SMTP_USER=`,
        `SMTP_PASS=`,
        `SMTP_SECURE=false`,
        `SMTP_FROM=`,
        // Licencia Enterprise (opcional). Vacío = edición Community.
        `DIDACTA_LICENSE_KEY=`,
        // TENANT_SETTINGS_ENC_KEY se deja sin definir a propósito: la app
        // genera una clave hex de 32 bytes en el primer arranque y la persiste
        // en el volumen `data`.
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      mounts: [
        {
          // Uploads de cursos, certificados y evidencias + la clave de cifrado
          // autogenerada. Es el volumen que hay que respaldar.
          type: "volume",
          name: "data",
          mountPath: "/app/data",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      image: "pgvector/pgvector:pg16",
      databaseName,
      password: databasePassword,
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: input.redisServiceName,
      password: redisPassword,
    },
  });

  return { services };
}
