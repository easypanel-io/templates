import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const databasePassword = randomPassword();
  const adminPassword = randomPassword();
  const dbServiceName = `${input.appServiceName}-db`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      deploy: {
        command: [
          `sed -i -e 's#^/venv/bin/sosse-admin default_admin$#DJANGO_SUPERUSER_PASSWORD="$ADMIN_PASSWORD" /venv/bin/sosse-admin createsuperuser --noinput --username admin --email admin@example.com || true#' -e '/Default credentials/d' /run.sh`,
          "exec bash /pg_run.sh",
        ].join(" && "),
      },
      env: [
        `ADMIN_PASSWORD=${adminPassword}`,
        `SOSSE_DB_NAME=$(PROJECT_NAME)`,
        `SOSSE_DB_USER=postgres`,
        `SOSSE_DB_PASS=${databasePassword}`,
        `SOSSE_DB_HOST=$(PROJECT_NAME)_${dbServiceName}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/var/lib/sosse",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: dbServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
