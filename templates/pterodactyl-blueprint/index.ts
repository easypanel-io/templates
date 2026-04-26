import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();
  const appKey = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        "APP_ENV=production",
        "APP_ENVIRONMENT_ONLY=false",
        "APP_TIMEZONE=UTC",
        "APP_DEBUG=false",
        `APP_URL=https://$(PRIMARY_DOMAIN)`,
        `APP_KEY=${appKey}`,
        `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        "DB_PORT=3306",
        "DB_DATABASE=$(PROJECT_NAME)",
        "DB_USERNAME=mariadb",
        `DB_PASSWORD=${databasePassword}`,
        `REDIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
        "REDIS_PORT=6379",
        `REDIS_PASSWORD=${redisPassword}`,
        "MAIL_FROM=noreply@$(EASYPANEL_HOST)",
        "MAIL_DRIVER=smtp",
        "MAIL_HOST=mail",
        "MAIL_PORT=1025",
        "MAIL_USERNAME=",
        "MAIL_PASSWORD=",
        "MAIL_ENCRYPTION=true",
        "CACHE_DRIVER=redis",
        "SESSION_DRIVER=redis",
        "QUEUE_CONNECTION=redis",
        "TRUSTED_PROXIES=*",
        "APP_SERVICE_AUTHOR=support@$(PRIMARY_DOMAIN)",
        "PTERODACTYL_TELEMETRY_ENABLED=false",
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
          name: "app_var",
          mountPath: "/app/var/",
        },
        {
          type: "volume",
          name: "nginx_config",
          mountPath: "/etc/nginx/http.d/",
        },
        {
          type: "volume",
          name: "letsencrypt_certs",
          mountPath: "/etc/letsencrypt/live",
        },
        {
          type: "volume",
          name: "app_logs",
          mountPath: "/app/storage/logs",
        },
        {
          type: "volume",
          name: "nginx_logs",
          mountPath: "/var/log/nginx",
        },
        {
          type: "volume",
          name: "blueprint_extensions",
          mountPath: "/blueprint_extensions",
        },
        {
          type: "volume",
          name: "app_data",
          mountPath: "/app",
        },
      ],
      scripts: [
        {
          name: "Create admin user (p:user:make)",
          script: "php artisan p:user:make",
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

  services.push({
    type: "redis",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      password: redisPassword,
    },
  });

  return { services };
}
