import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
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

        `DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `DB_DATABASE=$(PROJECT_NAME)`,
        `DB_USERNAME=mysql`,
        `DB_PASSWORD=${databasePassword}`,

        `REDIS_HOST=$(PROJECT_NAME)_${input.redisServiceName}`,
        `REDIS_PASSWORD=${redisPassword}`,

        `MAIL_FROM=noreply@example.com`,
        `MAIL_DRIVER=smtp`,
        `MAIL_HOST=mail`,
        `MAIL_PORT=1025`,
        `MAIL_USERNAME=`,
        `MAIL_PASSWORD=`,
        `MAIL_ENCRYPTION=true`,

        `CACHE_DRIVER=redis`,
        `SESSION_DRIVER=redis`,
        `QUEUE_CONNECTION=redis`,
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
          name: "var",
          mountPath: "/app/var/",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/app/storage/logs",
        },
        {
          type: "volume",
          name: "nginx",
          mountPath: "/etc/nginx/http.d/",
        },
      ],
    },
  });

  services.push({
    type: "mysql",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  services.push({
    type: "redis",
    data: {
      projectName: input.projectName,
      serviceName: input.redisServiceName,
      password: redisPassword,
    },
  });

  return { services };
}
