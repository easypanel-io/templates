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
  const jwtSecret = randomString(64);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)?sslmode=disable`,
        `REDIS_URL=redis://default:${redisPassword}@$(PROJECT_NAME)_${input.redisServiceName}:6379`,
        `JWT_SECRET=${jwtSecret}`,
        `HTTP_PORT=8080`,
        `APP_ENV=production`,
        `LOG_LEVEL=info`,
        `MEDIA_STORAGE_PATH=/data/media`,
        `ENGINE_STORE_PATH=/data/instances`,
        `ENGINE_AUTO_RECONNECT=true`,
        `ENGINE_MAX_INSTANCES=200`,
        `REGISTRATION_ENABLED=true`,
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
          mountPath: "/data",
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
    data: {
      serviceName: input.redisServiceName,
      password: redisPassword,
    },
  });

  return { services };
}
