import type { Output, Services } from "~templates-utils";
import { randomPassword } from "~templates-utils";

interface Input {
  appServiceName: string;
  appServiceImage: string;
  redisServiceName: string;
  databaseServiceName: string;
  databaseName: string;
}

// Função para gerar uma chave de aplicação Laravel válida (base64:32 bytes)
function generateLaravelAppKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Gerar 32 caracteres aleatórios
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();
  const appKey = generateLaravelAppKey();

  services.push({
    type: "box",
    data: {
      projectName: "$(PROJECT_NAME)",
      serviceName: input.appServiceName,
      codeInitialized: false,
      deployment: {
        type: "image",
        image: input.appServiceImage,
      },
      modules: {
        ide: true,        // VS Code integrado
        php: true,        // Suporte PHP habilitado
        nginx: true,      // Nginx habilitado
        advanced: true,   // Configurações avançadas
        deployments: true,
        git: true,
        domains: true,
        mounts: true,
        processes: true,
        env: true,
        resources: true,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
          path: "/",
          https: true,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "app-data",
          mountPath: "/app/var",
        },
        {
          type: "volume",
          name: "app-storage",
          mountPath: "/app/storage",
        },
        {
          type: "volume",
          name: "panel-logs",
          mountPath: "/var/log/panel",
        },
        {
          type: "volume",
          name: "nginx-config",
          mountPath: "/etc/nginx/http.d/",
        },
      ],
      env: {
        content: [
          `APP_ENV=production`,
          `APP_ENVIRONMENT_ONLY=false`,
          `APP_URL=https://$(PRIMARY_DOMAIN)`,
          `APP_TIMEZONE=UTC`,
          `APP_DEBUG=true`,
          `APP_KEY=${appKey}`,

          `DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
          `DB_DATABASE=${input.databaseName}`,
          `DB_USERNAME=mariadb`,
          `DB_PASSWORD=${databasePassword}`,
          `DB_PORT=3306`,

          `REDIS_HOST=$(PROJECT_NAME)_${input.redisServiceName}`,
          `REDIS_PASSWORD=${redisPassword}`,
          `REDIS_PORT=6379`,

          `MAIL_FROM=noreply@$(PRIMARY_DOMAIN)`,
          `MAIL_DRIVER=smtp`,
          `MAIL_HOST=mail`,
          `MAIL_PORT=1025`,
          `MAIL_USERNAME=`,
          `MAIL_PASSWORD=`,
          `MAIL_ENCRYPTION=true`,

          `CACHE_DRIVER=redis`,
          `SESSION_DRIVER=redis`,
          `QUEUE_CONNECTION=redis`,
          
          `TRUSTED_PROXIES=*`,
          `APP_SERVICE_AUTHOR=support@$(PRIMARY_DOMAIN)`,
          `PTERODACTYL_TELEMETRY_ENABLED=false`,
        ].join("\n"),
      },
      resources: {
        limits: {
          memory: 2048,
          cpuShares: 1000,
        },
      },
    },
  });

  services.push({
    type: "mariadb",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
      database: input.databaseName,
    },
  });

  services.push({
    type: "redis",
    data: { serviceName: input.redisServiceName, password: redisPassword },
  });

  return { services };
}
