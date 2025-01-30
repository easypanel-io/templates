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
        `PGSQL_USER=postgres`,
        `PGSQL_PASSWD=${databasePassword}`,
        `PGSQL_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `PGSQL_DBNAME=$(PROJECT_NAME)`,
        `REDIS_SERVER=$(PROJECT_NAME)_${input.appServiceName}-redis`,
        `REDIS_PASSWD=${redisPassword}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5985,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "faraday",
          mountPath: "/home/faraday/.faraday",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
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
