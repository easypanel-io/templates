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
        `SUPERUSER_EMAIL=${input.netboxEmail}`,
        `SUPERUSER_PASSWORD=${input.netboxPassword}`,
        `ALLOWED_HOST=$(PRIMARY_DOMAIN)`,
        `DB_NAME=$(PROJECT_NAME)`,
        `DB_USER=postgres`,
        `DB_PORT=5432`,
        `DB_PASSWORD=${databasePassword}`,
        `DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `REDIS_HOST=$(PROJECT_NAME)_${input.redisServiceName}`,
        `REDIS_PORT=6379`,
        `REDIS_PASSWORD=${redisPassword}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
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
