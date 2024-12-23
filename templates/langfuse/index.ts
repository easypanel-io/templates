import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-web`,
      env: [
        `NEXTAUTH_URL=https://$(PRIMARY_DOMAIN)`,
        `NEXTAUTH_SECRET=mysecret`,
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
        `DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
        `SALT=mysalt`,
        `ENCRYPTION_KEY=0000000000000000000000000000000000000000000000000000000000000000`,
        `TELEMETRY_ENABLED=true`,
        `LANGFUSE_ENABLE_EXPERIMENTAL_FEATURES=true`,
        `CLICKHOUSE_MIGRATION_URL=clickhouse://$(PROJECT_NAME)_${input.appServiceName}-clickhouse:9000`,
        `CLICKHOUSE_URL=http://$(PROJECT_NAME)_${input.appServiceName}-clickhouse:8123`,
        `CLICKHOUSE_USER=${input.clickHouseUser}`,
        `CLICKHOUSE_PASSWORD=${input.clickHousePassword}`,
        `CLICKHOUSE_CLUSTER_ENABLED=false`,
        `LANGFUSE_S3_EVENT_UPLOAD_BUCKET=langfuse`,
        `LANGFUSE_S3_EVENT_UPLOAD_REGION=auto`,
        `LANGFUSE_S3_EVENT_UPLOAD_ACCESS_KEY_ID=${input.minioUser}`,
        `LANGFUSE_S3_EVENT_UPLOAD_SECRET_ACCESS_KEY=${input.minioPassword}`,
        `LANGFUSE_S3_EVENT_UPLOAD_ENDPOINT=http://$(PROJECT_NAME)_${input.appServiceName}-minio:9000`,
        `LANGFUSE_S3_EVENT_UPLOAD_FORCE_PATH_STYLE=true`,
        `LANGFUSE_S3_EVENT_UPLOAD_PREFIX=events/`,
        `LANGFUSE_S3_MEDIA_UPLOAD_BUCKET=langfuse`,
        `LANGFUSE_S3_MEDIA_UPLOAD_REGION=auto`,
        `LANGFUSE_S3_MEDIA_UPLOAD_ACCESS_KEY_ID=${input.minioUser}`,
        `LANGFUSE_S3_MEDIA_UPLOAD_SECRET_ACCESS_KEY=${input.minioPassword}`,
        `LANGFUSE_S3_MEDIA_UPLOAD_ENDPOINT=http://$(PROJECT_NAME)_${input.appServiceName}-minio:9000`,
        `LANGFUSE_S3_MEDIA_UPLOAD_FORCE_PATH_STYLE=true`,
        `LANGFUSE_S3_MEDIA_UPLOAD_PREFIX=media/`,
        `REDIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
        `REDIS_PORT=6379`,
        `REDIS_AUTH=${redisPassword}`,
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
      env: [
        `DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
        `SALT=mysalt`,
        `ENCRYPTION_KEY=0000000000000000000000000000000000000000000000000000000000000000`,
        `TELEMETRY_ENABLED=true`,
        `LANGFUSE_ENABLE_EXPERIMENTAL_FEATURES=true`,
        `CLICKHOUSE_MIGRATION_URL=clickhouse://$(PROJECT_NAME)_${input.appServiceName}-clickhouse:9000`,
        `CLICKHOUSE_URL=http://$(PROJECT_NAME)_${input.appServiceName}-clickhouse:8123`,
        `CLICKHOUSE_USER=${input.clickHouseUser}`,
        `CLICKHOUSE_PASSWORD=${input.clickHousePassword}`,
        `CLICKHOUSE_CLUSTER_ENABLED=false`,
        `LANGFUSE_S3_EVENT_UPLOAD_BUCKET=langfuse`,
        `LANGFUSE_S3_EVENT_UPLOAD_REGION=auto`,
        `LANGFUSE_S3_EVENT_UPLOAD_ACCESS_KEY_ID=${input.minioUser}`,
        `LANGFUSE_S3_EVENT_UPLOAD_SECRET_ACCESS_KEY=${input.minioPassword}`,
        `LANGFUSE_S3_EVENT_UPLOAD_ENDPOINT=http://$(PROJECT_NAME)_${input.appServiceName}-minio:9000`,
        `LANGFUSE_S3_EVENT_UPLOAD_FORCE_PATH_STYLE=true`,
        `LANGFUSE_S3_EVENT_UPLOAD_PREFIX=events/`,
        `LANGFUSE_S3_MEDIA_UPLOAD_BUCKET=langfuse`,
        `LANGFUSE_S3_MEDIA_UPLOAD_REGION=auto`,
        `LANGFUSE_S3_MEDIA_UPLOAD_ACCESS_KEY_ID=${input.minioUser}`,
        `LANGFUSE_S3_MEDIA_UPLOAD_SECRET_ACCESS_KEY=${input.minioPassword}`,
        `LANGFUSE_S3_MEDIA_UPLOAD_ENDPOINT=http://$(PROJECT_NAME)_${input.appServiceName}-minio:9000`,
        `LANGFUSE_S3_MEDIA_UPLOAD_FORCE_PATH_STYLE=true`,
        `LANGFUSE_S3_MEDIA_UPLOAD_PREFIX=media/`,
        `REDIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
        `REDIS_PORT=6379`,
        `REDIS_AUTH=${redisPassword}`,
      ].join("\n"),
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

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-minio`,
      env: [
        `MINIO_SERVER_URL=https://$(EASYPANEL_DOMAIN)`,
        `MINIO_ROOT_USER=admin`,
        `MINIO_ROOT_PASSWORD=password`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.minioImage,
      },
      deploy: {
        command: 'minio server /data --console-address ":9001"',
      },
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
