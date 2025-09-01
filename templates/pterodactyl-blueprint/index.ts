import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `APP_ENV=production`,
        `APP_ENVIRONMENT_ONLY=false`,
        `APP_URL=https://$(PRIMARY_DOMAIN)`,
        `APP_TIMEZONE=UTC`,
        `APP_DEBUG=true`,
        `APP_KEY=`,

        `DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `DB_DATABASE=$(PROJECT_NAME)`,
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
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
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
    },
  });

  services.push({
    type: "mariadb",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  services.push({
    type: "redis",
    data: { serviceName: input.redisServiceName, password: redisPassword },
  });

  return { services };
}
