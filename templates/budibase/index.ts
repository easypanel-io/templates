import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const apiEncryptionKey = randomString(32);
  const jwtSecret = randomString(32);
  const minioRootUser = "budibase";
  const minioRootPassword = "password";
  const couchDbPassword = randomPassword();
  const couchDbUser = "budibase";
  const redisPassword = randomPassword();
  const internalApiKey = randomString(32);

  services.push({
    type: "redis",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      password: redisPassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-couchdb`,
      env: [
        `COUCHDB_PASSWORD=${couchDbPassword}`,
        `COUCHDB_USER=${couchDbUser}`,
        `TARGETBUILD=docker-compose`,
      ].join("\n"),
      source: {
        type: "image",
        image: "budibase/couchdb:v3.3.3-sqs-v2.1.1",
      },
      mounts: [
        {
          type: "volume",
          name: "couchdb-data",
          mountPath: "/opt/couchdb/data",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-minio`,
      env: [
        `MINIO_ROOT_USER=${minioRootUser}`,
        `MINIO_ROOT_PASSWORD=${minioRootPassword}`,
        `MINIO_BROWSER=on`,
      ].join("\n"),
      source: {
        type: "image",
        image: "minio/minio:latest",
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
      domains: [
        {
          host: "console-$(EASYPANEL_DOMAIN)",
          port: 9001,
        },
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 9000,
        },
      ],
      deploy: {
        command: `minio server /data --console-address ":9001"`,
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-worker`,
      env: [
        `SELF_HOSTED=1`,
        `PORT=4003`,
        `CLUSTER_PORT=10000`,
        `API_ENCRYPTION_KEY=${apiEncryptionKey}`,
        `JWT_SECRET=${jwtSecret}`,
        `MINIO_URL=http://$(PROJECT_NAME)-${input.appServiceName}-minio:9000`,
        `MINIO_ACCESS_KEY=${minioRootUser}`,
        `MINIO_SECRET_KEY=${minioRootPassword}`,
        `APPS_URL=http://$(PROJECT_NAME)-${input.appServiceName}-app:4002`,
        `COUCH_DB_USERNAME=${couchDbUser}`,
        `COUCH_DB_PASSWORD=${couchDbPassword}`,
        `COUCH_DB_URL=http://${couchDbUser}:${couchDbPassword}@$(PROJECT_NAME)_${input.appServiceName}-couchdb:5984`,
        `INTERNAL_API_KEY=${internalApiKey}`,
        `REDIS_URL=$(PROJECT_NAME)_${input.appServiceName}-redis:6379`,
        `REDIS_PASSWORD=${redisPassword}`,
        `OFFLINE_MODE=false`,
      ].join("\n"),
      source: {
        type: "image",
        image: "budibase/worker",
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-app`,
      env: [
        `SELF_HOSTED=1`,
        `COUCH_DB_URL=http://${couchDbUser}:${couchDbPassword}@$(PROJECT_NAME)_${input.appServiceName}-couchdb:5984`,
        `WORKER_URL=http://$(PROJECT_NAME)_${input.appServiceName}-worker:4003`,
        `MINIO_URL=http://$(PROJECT_NAME)-${input.appServiceName}-minio:9000`,
        `MINIO_ACCESS_KEY=${minioRootUser}`,
        `MINIO_SECRET_KEY=${minioRootPassword}`,
        `INTERNAL_API_KEY=${internalApiKey}`,
        `BUDIBASE_ENVIRONMENT=PRODUCTION`,
        `PORT=4002`,
        `API_ENCRYPTION_KEY=${apiEncryptionKey}`,
        `JWT_SECRET=${jwtSecret}`,
        `LOG_LEVEL=info`,
        `ENABLE_ANALYTICS=true`,
        `REDIS_URL=$(PROJECT_NAME)_${input.appServiceName}-redis:6379`,
        `REDIS_PASSWORD=${redisPassword}`,
        `BB_ADMIN_USER_EMAIL=${input.adminEmail}`,
        `BB_ADMIN_USER_PASSWORD=${input.adminPassword}`,
        `PLUGINS_DIR=`,
        `OFFLINE_MODE=false`,
      ].join("\n"),
      source: {
        type: "image",
        image: "budibase/apps",
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `PROXY_RATE_LIMIT_WEBHOOKS_PER_SECOND=10`,
        `PROXY_RATE_LIMIT_API_PER_SECOND=20`,
        `APPS_UPSTREAM_URL=http://$(PROJECT_NAME)_${input.appServiceName}-app:4002`,
        `WORKER_UPSTREAM_URL=http://$(PROJECT_NAME)_${input.appServiceName}-worker:4003`,
        `MINIO_UPSTREAM_URL=http://$(PROJECT_NAME)_${input.appServiceName}-minio:9000`,
        `COUCHDB_UPSTREAM_URL=http://$(PROJECT_NAME)_${input.appServiceName}-couchdb:5984`,
        `RESOLVER=127.0.0.11`,
      ].join("\n"),
      source: {
        type: "image",
        image: "budibase/proxy",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 10000,
        },
      ],
    },
  });

  return { services };
}
