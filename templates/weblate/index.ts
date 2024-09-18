import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const redisPassword = randomPassword();
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `REDIS_HOST=${input.redisServiceName}`,
        `REDIS_PORT=6379`,
        `REDIS_DB=1`,
        `REDIS_PASSWORD=${redisPassword}`,
        `WEBLATE_DEFAULT_FROM_EMAIL=${input.emailNoReply}`,
        `WEBLATE_EMAIL_HOST=${input.emailHost}`,
        `WEBLATE_EMAIL_HOST_USER=${input.emailUsername}`,
        `WEBLATE_EMAIL_HOST_PASSWORD=${input.emailPassword}`,
        `WEBLATE_SERVER_EMAIL=${input.emailUsername}`,
        `WEBLATE_SITE_DOMAIN=https://$(PRIMARY_DOMAIN)`,
        `WEBLATE_ADMIN_PASSWORD=changeme`,
        `WEBLATE_ADMIN_EMAIL=changeme@easypanel.io`,
        `POSTGRES_PASSWORD=${databasePassword}`,
        `POSTGRES_USER=postgres`,
        `POSTGRES_DATABASE=$(PROJECT_NAME)`,
        `POSTGRES_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `POSTGRES_SSL_MODE=disable`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/app/data",
        },
        {
          type: "volume",
          name: "cache",
          mountPath: "/app/cache",
        },
      ],
    },
  });

  services.push({
    type: "redis",
    data: { serviceName: input.redisServiceName, password: redisPassword },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
