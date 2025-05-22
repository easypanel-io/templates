import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `APP_ADMIN_EMAIL=${input.adminEmail}`,
        `APP_ADMIN_PASSWORD=${input.adminPassword}`,
        `APP_TIMEZONE=UTC`,
        `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `DB_PORT=3306`,
        `DB_DATABASE=$(PROJECT_NAME)`,
        `DB_USERNAME=mariadb`,
        `DB_PASSWORD=${databasePassword}`,
        `DB_CHARSET=utf8mb4`,
      ].join("\n"),
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
      mounts: [
        {
          type: "volume",
          name: "app_images",
          mountPath: "/var/www/html/public/img",
        },
        {
          type: "volume",
          name: "app_logs",
          mountPath: "/var/www/html/app/logs",
        },
        {
          type: "volume",
          name: "app_backup",
          mountPath: "/var/www/html/public/backup",
        },
        {
          type: "volume",
          name: "app_themes",
          mountPath: "/var/www/html/public/themes",
        },
        {
          type: "volume",
          name: "app_migrate",
          mountPath: "/var/www/html/app/migrations",
        },
      ],
    },
  });

  services.push({
    type: "mariadb",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  return { services };
}
