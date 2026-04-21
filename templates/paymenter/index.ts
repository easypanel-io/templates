import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const databasePassword = randomPassword();
  const redisPassword = randomPassword();

  services.push({
    type: "mariadb",
    data: {
      serviceName: `${input.appServiceName}-mysql`,
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
      env: [
        `DB_PASSWORD=${databasePassword}`,
        `APP_ENV=production`,
        `CACHE_STORE=redis`,
        `SESSION_DRIVER=redis`,
        `QUEUE_CONNECTION=redis`,
        `REDIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
        `REDIS_PASSWORD=${redisPassword}`,
        `DB_CONNECTION=mariadb`,
        `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-mysql`,
        `DB_PORT=3306`,
        `DB_DATABASE=$(PROJECT_NAME)`,
        `DB_USERNAME=mariadb`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "app-var",
          mountPath: "/app/var",
        },
        {
          type: "volume",
          name: "app-logs",
          mountPath: "/app/storage/logs",
        },
        {
          type: "volume",
          name: "app-public",
          mountPath: "/app/storage/public",
        },
      ],
    },
  });

  return { services };
} 