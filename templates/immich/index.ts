import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();

  const common_env = [
    `DB_DATABASE_NAME=$(PROJECT_NAME)`,
    `DB_USERNAME=postgres`,
    `DB_PASSWORD=${databasePassword}`,
    `DB_HOSTNAME=$(PROJECT_NAME)_${input.appServiceName}-db`,
    `REDIS_HOSTNAME=$(PROJECT_NAME)_${input.appServiceName}-redis`,
    `REDIS_PORT=6379`,
    `REDIS_USERNAME=default`,
    `REDIS_PASSWORD=${redisPassword}`,
    `UPLOAD_LOCATION=./library`,
    `DB_DATA_LOCATION=./postgres`,
  ].join("\n");

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [common_env].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 2283,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "upload",
          mountPath: "/usr/src/app/upload",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-ml`,
      env: [common_env].join("\n"),
      source: {
        type: "image",
        image: input.mlServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
      image:
        "docker.io/tensorchord/pgvecto-rs:pg14-v0.2.0@sha256:90724186f0a3517cf6914295b5ab410db9ce23190a2d9d0b9dd6463e3fa298f0",
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
