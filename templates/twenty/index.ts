import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();
  const appSecret = randomString(32);

  const common_envs = [
    `NODE_PORT=3000`,
    `PG_DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)?sslmode=disable`,
    `REDIS_URL=redis://default:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379`,
    `STORAGE_TYPE=local`,
    `APP_SECRET=${appSecret}`,
    `SIGN_IN_PREFILLED=false`,
  ].join("\n");
  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [common_envs, `SERVER_URL=https://$(PRIMARY_DOMAIN)`].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "server-local-data",
          mountPath: "/app/packages/twenty-server/.local-storage",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-worker`,
      env: [
        common_envs,
        `SERVER_URL=https://$(PROJECT_NAME)-${input.appServiceName}.$(EASYPANEL_HOST)`,
        `DISABLE_DB_MIGRATIONS=true`,
        `DISABLE_CRON_JOBS_REGISTRATION=true`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: "yarn worker:prod",
      },
      mounts: [
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}/volumes/server-local-data`,
          mountPath: "/app/packages/twenty-server/.local-storage",
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
