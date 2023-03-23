import {
  Output,
  randomPassword, Services
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const redisPassword = randomPassword();
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `SUPERUSER_EMAIL=${input.netboxEmail}`,
        `SUPERUSER_PASSWORD=${input.netboxPassword}`,
        `ALLOWED_HOST=${input.domain}`,
        `DB_NAME=${input.projectName}`,
        `DB_USER=postgres`,
        `DB_PORT=5432`,
        `DB_PASSWORD=${databasePassword}`,
        `DB_HOST=${input.projectName}_${input.databaseServiceName}`,
        `REDIS_HOST=${input.projectName}_${input.redisServiceName}`,
        `REDIS_PORT=6379`,
        `REDIS_PASSWORD=${redisPassword}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 8000,
        secure: true,
      },
      domains: [
        {
          name: input.domain,
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
