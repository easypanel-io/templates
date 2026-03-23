import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const dbPassword = randomPassword();
  const redisPassword = randomPassword();
  const meiliMasterKey = randomString(32);
  const jwtSecret = randomString(64);
  const encryptionKey = randomString(64);
  const storageEncryptionKey = randomString(64);

  const base = `$(PROJECT_NAME)_${input.appServiceName}`;

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: dbPassword,
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: `${input.appServiceName}-valkey`,
      password: redisPassword,
      image: input.valkeyImage,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-meilisearch`,
      source: {
        type: "image",
        image: input.meilisearchImage,
      },
      env: [
        `MEILI_MASTER_KEY=${meiliMasterKey}`,
        `MEILI_NO_ANALYTICS=true`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "meilisearch_data",
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
        image: input.tikaImage ?? "apache/tika:3.2.2.0-full",
      },
    },
  });

  const appEnv = [
    `NODE_ENV=production`,
    `PORT_FRONTEND=3000`,
    `APP_URL=https://$(PRIMARY_DOMAIN)`,
    `ORIGIN=https://$(PRIMARY_DOMAIN)`,
    `DATABASE_URL=postgresql://postgres:${dbPassword}@${base}-db:5432/$(PROJECT_NAME)?sslmode=disable`,
    `MEILI_HOST=http://${base}-meilisearch:7700`,
    `MEILI_MASTER_KEY=${meiliMasterKey}`,
    `MEILI_INDEXING_BATCH=500`,
    `REDIS_HOST=${base}-valkey`,
    `REDIS_PORT=6379`,
    `REDIS_PASSWORD=${redisPassword}`,
    `REDIS_TLS_ENABLED=false`,
    `TIKA_URL=http://${base}-tika:9998`,
    `STORAGE_TYPE=local`,
    `STORAGE_LOCAL_ROOT_PATH=/var/data/open-archiver`,
    `BODY_SIZE_LIMIT=100M`,
    `JWT_SECRET=${jwtSecret}`,
    `ENCRYPTION_KEY=${encryptionKey}`,
    `STORAGE_ENCRYPTION_KEY=${storageEncryptionKey}`,
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
          port: 3000,
        },
      ],
      env: appEnv,
      mounts: [
        {
          type: "volume",
          name: "storage",
          mountPath: "/var/data/open-archiver",
        },
      ],
    },
  });

  return { services };
}
