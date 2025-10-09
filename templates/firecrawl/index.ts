import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const bullAuthKey = randomString(16);
  const testApiKey = randomString(16);
  const databasePassword = randomPassword();

  const common_envs = [
    `REDIS_URL=redis://default:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379`,
    `REDIS_RATE_LIMIT_URL=redis://default:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379`,
    `PLAYWRIGHT_MICROSERVICE_URL=http://$(PROJECT_NAME)_${input.appServiceName}-playwright:3000/scrape`,
    "USE_DB_AUTHENTICATION=false",
    `BULL_AUTH_KEY=${bullAuthKey}`,
    `TEST_API_KEY=${testApiKey}`,
    "LOGGING_LEVEL=info",
  ].join("\n");

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3002,
        },
      ],
      env: [
        "HOST=0.0.0.0",
        "PORT=3002",
        "FLY_PROCESS_GROUP=app",
        common_envs,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/app/data",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-worker`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: ["FLY_PROCESS_GROUP=worker", common_envs].join("\n"),
      mounts: [
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}/volumes/data`,
          mountPath: "/app/data",
        },
      ],
      deploy: {
        command: "pnpm run worker:production",
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-playwright`,
      source: {
        type: "image",
        image: input.playwrightServiceImage,
      },
      env: ["PORT=3000", "BLOCK_MEDIA=false"].join("\n"),
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      password: databasePassword,
    },
  });

  return { services };
}
