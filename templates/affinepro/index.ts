import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();

  const common_envs = [
    `REDIS_SERVER_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
    `REDIS_SERVER_PASSWORD=${redisPassword}`,
    `DATABASE_URL=postgresql://affine:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
    `AFFINE_INDEXER_ENABLED=false`,
  ].join("\n");

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [common_envs].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3010,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "storage",
          mountPath: "/root/.affine/storage",
        },
        {
          type: "volume",
          name: "config",
          mountPath: "/root/.affine/config",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-migration`,
      env: [common_envs].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: "node ./scripts/self-host-predeploy.js",
      },
      mounts: [
        {
          type: "volume",
          name: "storage",
          mountPath: "/root/.affine/storage",
        },
        {
          type: "volume",
          name: "config",
          mountPath: "/root/.affine/config",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
      user: "affine",
      image: "pgvector/pgvector:pg16",
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
