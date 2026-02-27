import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const pgPassword = randomPassword();
  const redisPassword = randomPassword();
  const meiliMasterKey = randomString(32);
  const jwtSecret = randomString(64);
  const encryptionKey = randomString(64);
  const storageEncryptionKey = randomString(64);

  const pgHost = `$(PROJECT_NAME)_${input.appServiceName}-db`;
  const redisHost = `$(PROJECT_NAME)_${input.appServiceName}-valkey`;
  const meiliHost = `$(PROJECT_NAME)_${input.appServiceName}-meilisearch`;
  const tikaHost = `$(PROJECT_NAME)_${input.appServiceName}-tika`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 3000 }],
      env: [
        "NODE_ENV=production",
        "PORT_BACKEND=4000",
        "PORT_FRONTEND=3000",
        "APP_URL=https://$(PRIMARY_DOMAIN)",
        "ORIGIN=https://$(PRIMARY_DOMAIN)",
        `SYNC_FREQUENCY=* * * * *`,
        "ALL_INCLUSIVE_ARCHIVE=false",
        `POSTGRES_DB=$(PROJECT_NAME)`,
        `POSTGRES_USER=postgres`,
        `POSTGRES_PASSWORD=${pgPassword}`,
        `DATABASE_URL=postgresql://postgres:${pgPassword}@${pgHost}:5432/$(PROJECT_NAME)`,
        `MEILI_MASTER_KEY=${meiliMasterKey}`,
        `MEILI_HOST=http://${meiliHost}:7700`,
        "MEILI_INDEXING_BATCH=500",
        `REDIS_HOST=${redisHost}`,
        "REDIS_PORT=6379",
        `REDIS_PASSWORD=${redisPassword}`,
        "REDIS_TLS_ENABLED=false",
        "STORAGE_TYPE=local",
        "BODY_SIZE_LIMIT=100M",
        "STORAGE_LOCAL_ROOT_PATH=/var/data/open-archiver",
        `ENCRYPTION_KEY=${encryptionKey}`,
        `STORAGE_ENCRYPTION_KEY=${storageEncryptionKey}`,
        `JWT_SECRET=${jwtSecret}`,
        "JWT_EXPIRES_IN=7d",
        "ENABLE_DELETION=false",
        `TIKA_URL=http://${tikaHost}:9998`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "archiver-data",
          mountPath: "/var/data/open-archiver",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: pgPassword,
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: `${input.appServiceName}-valkey`,
      password: redisPassword,
      image: "valkey/valkey:8-alpine",
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-meilisearch`,
      source: {
        type: "image",
        image: "getmeili/meilisearch:v1.15",
      },
      env: [
        `MEILI_MASTER_KEY=${meiliMasterKey}`,
        "MEILI_SCHEDULE_SNAPSHOT=86400",
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "meili-data",
          mountPath: "/meili_data",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-tika`,
      source: {
        type: "image",
        image: "apache/tika:3.2.2.0-full",
      },
    },
  });

  return { services };
}
