import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

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
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5985,
        },
      ],
      deploy: {
        command: "/entrypoint.sh",
      },
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
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      source: {
        type: "image",
        image: input.redisImage,
      },
      deploy: {
        command: "redis-server",
      },
      mounts: [
        {
          type: "volume",
          name: "redis-data",
          mountPath: "/data",
        },
      ],
    },
  });

  return { services };
}
