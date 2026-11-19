import { Output, randomPassword, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const dbPassword = randomPassword();
  const jwtSecret = randomString(64);

  const databaseUrl = `postgresql://postgres:${dbPassword}@$(PROJECT_NAME)_${input.dbServiceName}:5432/frames`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: "elevenam/frames:latest-2025-04-23-21-12",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      env: [
        `DATABASE_URL=${databaseUrl}`,
        `DIRECT_DATABASE_URL=${databaseUrl}`,
        `REDIS_HOST=$(PROJECT_NAME)_${input.redisServiceName}`,
        `REDIS_PORT=6379`,
        `REDIS_DB=0`,
        `REDIS_TTL=86400`,
        `JWT_SECRET=${jwtSecret}`,
        `DEFAULT_LANGUAGE=en-US`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "media",
          mountPath: "/media",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.dbServiceName,
      source: {
        type: "image",
        image: "pgvector/pgvector:pg14",
      },
      env: [
        `POSTGRES_USER=postgres`,
        `POSTGRES_PASSWORD=${dbPassword}`,
        `POSTGRES_DB=frames`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "db-data",
          mountPath: "/var/lib/postgresql/data",
        },
      ],
    },
  });

  // Frames reads only REDIS_HOST/PORT/DB — no password support in the codebase.
  // Run Redis without auth so ioredis can connect.
  services.push({
    type: "app",
    data: {
      serviceName: input.redisServiceName,
      source: {
        type: "image",
        image: "redis:7-alpine",
      },
      deploy: {
        command: "redis-server --save 60 1 --loglevel warning",
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
