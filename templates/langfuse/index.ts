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
  const crypto = require("crypto");
  const s3Bucket = "langfuse";
  const s3AccessKey = `GK${randomString(16)}`;
  const s3SecretKey = crypto.randomBytes(32).toString("hex");
  const garageRpcSecret = crypto.randomBytes(32).toString("hex");
  const garageAdminToken = crypto.randomBytes(32).toString("hex");
  const garageMetricsToken = crypto.randomBytes(32).toString("hex");

  const common_envs = [
    `DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
    `SALT=${randomString(32)}`,
    `ENCRYPTION_KEY=${crypto.randomBytes(32).toString("hex")}`,
    `TELEMETRY_ENABLED=true`,
    `LANGFUSE_ENABLE_EXPERIMENTAL_FEATURES=true`,
    `CLICKHOUSE_MIGRATION_URL=clickhouse://$(PROJECT_NAME)_${input.appServiceName}-clickhouse:9000`,
    `CLICKHOUSE_URL=http://$(PROJECT_NAME)_${input.appServiceName}-clickhouse:8123`,
    `CLICKHOUSE_USER=${input.clickHouseUser}`,
    `CLICKHOUSE_PASSWORD=${input.clickHousePassword}`,
    `CLICKHOUSE_CLUSTER_ENABLED=false`,
    `LANGFUSE_S3_EVENT_UPLOAD_BUCKET=${s3Bucket}`,
    `LANGFUSE_S3_EVENT_UPLOAD_REGION=garage`,
    `LANGFUSE_S3_EVENT_UPLOAD_ACCESS_KEY_ID=${s3AccessKey}`,
    `LANGFUSE_S3_EVENT_UPLOAD_SECRET_ACCESS_KEY=${s3SecretKey}`,
    `LANGFUSE_S3_EVENT_UPLOAD_ENDPOINT=http://$(PROJECT_NAME)_${input.appServiceName}-garage:3900`,
    `LANGFUSE_S3_EVENT_UPLOAD_FORCE_PATH_STYLE=true`,
    `LANGFUSE_S3_EVENT_UPLOAD_PREFIX=events/`,
    `LANGFUSE_S3_MEDIA_UPLOAD_BUCKET=${s3Bucket}`,
    `LANGFUSE_S3_MEDIA_UPLOAD_REGION=garage`,
    `LANGFUSE_S3_MEDIA_UPLOAD_ACCESS_KEY_ID=${s3AccessKey}`,
    `LANGFUSE_S3_MEDIA_UPLOAD_SECRET_ACCESS_KEY=${s3SecretKey}`,
    `LANGFUSE_S3_MEDIA_UPLOAD_ENDPOINT=http://$(PROJECT_NAME)_${input.appServiceName}-garage:3900`,
    `LANGFUSE_S3_MEDIA_UPLOAD_FORCE_PATH_STYLE=true`,
    `LANGFUSE_S3_MEDIA_UPLOAD_PREFIX=media/`,
    `REDIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
    `REDIS_PORT=6379`,
    `REDIS_AUTH=${redisPassword}`,
  ];
  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-web`,
      env: [
        `NEXTAUTH_URL=https://$(PRIMARY_DOMAIN)`,
        `NEXTAUTH_SECRET=${randomString(32)}`,
        `LANGFUSE_INIT_ORG_ID=`,
        `LANGFUSE_INIT_ORG_NAME=`,
        `LANGFUSE_INIT_PROJECT_ID=`,
        `LANGFUSE_INIT_PROJECT_NAME=`,
        `LANGFUSE_INIT_PROJECT_PUBLIC_KEY=`,
        `LANGFUSE_INIT_PROJECT_SECRET_KEY=`,
        `LANGFUSE_INIT_USER_EMAIL=`,
        `LANGFUSE_INIT_USER_NAME=`,
        `LANGFUSE_INIT_USER_PASSWORD=`,
        `LANGFUSE_SDK_CI_SYNC_PROCESSING_ENABLED=false`,
        `LANGFUSE_READ_FROM_POSTGRES_ONLY=false`,
        `LANGFUSE_READ_FROM_CLICKHOUSE_ONLY=true`,
        `LANGFUSE_RETURN_FROM_CLICKHOUSE=true`,
        common_envs.join("\n"),
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/",
          port: 80,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-worker`,
      env: common_envs.join("\n"),
      source: {
        type: "image",
        image: input.workerImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/",
          port: 80,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-clickhouse`,
      env: [
        `CLICKHOUSE_DB=default`,
        `CLICKHOUSE_USER=${input.clickHouseUser}`,
        `CLICKHOUSE_PASSWORD=${input.clickHousePassword}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.clickHouseImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "langfuse_clickhouse_data",
          mountPath: "/var/lib/clickhouse",
        },
        {
          type: "volume",
          name: "langfuse_clickhouse_logs",
          mountPath: "/var/log/clickhouse-server",
        },
      ],
    },
  });

  // MinIO's Docker images are no longer freely pullable (MinIO moved to a
  // licensed "AIStor" product). Garage is a genuinely open-source (AGPL),
  // MinIO-API-compatible object store; --single-node --default-bucket
  // auto-creates the access key and bucket on first boot.
  const garageToml = `metadata_dir = "/data/meta"
data_dir = "/data/data"
db_engine = "sqlite"

replication_factor = 1

rpc_bind_addr = "[::]:3901"
rpc_public_addr = "127.0.0.1:3901"
rpc_secret = "${garageRpcSecret}"

[s3_api]
s3_region = "garage"
api_bind_addr = "[::]:3900"
root_domain = ".s3.garage.localhost"

[admin]
api_bind_addr = "[::]:3903"
admin_token = "${garageAdminToken}"
metrics_token = "${garageMetricsToken}"`;

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-garage`,
      env: [
        `GARAGE_CONFIG_FILE=/etc/garage.toml`,
        `GARAGE_DEFAULT_ACCESS_KEY=${s3AccessKey}`,
        `GARAGE_DEFAULT_SECRET_KEY=${s3SecretKey}`,
        `GARAGE_DEFAULT_BUCKET=${s3Bucket}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.garageImage,
      },
      deploy: {
        command: "/garage server --single-node --default-bucket",
      },
      mounts: [
        {
          type: "volume",
          name: "garage-data",
          mountPath: "/data",
        },
        {
          type: "file",
          content: garageToml,
          mountPath: "/etc/garage.toml",
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
