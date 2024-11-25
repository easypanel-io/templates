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
      env: [
        `HOST=$(PRIMARY_DOMAIN)`,
        `PROTOCOL=https`,
        `PORT=443`,
        `APP_ENV=production`,
        `REDIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
        `REDIS_USERNAME=default`,
        `REDIS_PASSWORD=${redisPassword}`,
        `POSTGRES_HOST=$(PROJECT_NAME)_${input.appServiceName}-postgres`,
        `POSTGRES_DATABASE=$(PROJECT_NAME)`,
        `POSTGRES_USERNAME=postgres`,
        `POSTGRES_PASSWORD=${databasePassword}`,
        `ENCRYPTION_KEY=your_encryption_key_here`,
        `WEBHOOK_SECRET_KEY=your_webhook_secret_key_here`,
        `APP_SECRET_KEY=your_app_secret_key_here`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/",
          port: 443,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "storage",
          mountPath: "/automatisch/storage",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-worker`,
      env: [
        `APP_ENV=production`,
        `REDIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
        `REDIS_PASSWORD=${redisPassword}`,
        `POSTGRES_HOST=$(PROJECT_NAME)_${input.appServiceName}-postgres`,
        `POSTGRES_DATABASE=$(PROJECT_NAME)`,
        `POSTGRES_USERNAME=postgres`,
        `POSTGRES_PASSWORD=${databasePassword}`,
        `ENCRYPTION_KEY=your_encryption_key_here`,
        `WEBHOOK_SECRET_KEY=your_webhook_secret_key_here`,
        `APP_SECRET_KEY=your_app_secret_key_here`,
        `WORKER=true`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}/volumes/storage`,
          mountPath: "/automatisch/storage",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-postgres`,
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
