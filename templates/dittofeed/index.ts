import crypto from "crypto";
import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const secretKey = crypto.randomBytes(32).toString("base64");

  const app_envs = [
    `DATABASE_USER=postgres`,
    `DATABASE_PASSWORD=${databasePassword}`,
    `DATABASE_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
    `DATABASE_PORT=5432`,
    `CLICKHOUSE_USER=${input.clickHouseUser}`,
    `CLICKHOUSE_PASSWORD=${input.clickHousePassword}`,
    `CLICKHOUSE_HOST=http://$(PROJECT_NAME)_${input.appServiceName}-clickhouse:8123`,
    `TEMPORAL_ADDRESS=$(PROJECT_NAME)_${input.appServiceName}-temporal:7233`,
    `NODE_ENV=production`,
    `WORKSPACE_NAME=${input.defaultWorkspaceName}`,
    `AUTH_MODE=single-tenant`,
    `SECRET_KEY=${secretKey}`,
    `PASSWORD=${input.dittofeedPassword}`,
    `DASHBOARD_API_BASE=https://$(PRIMARY_DOMAIN)`,
    `SESSION_COOKIE_SECURE=true`,
    `BOOTSTRAP=true`,
  ].join("\n");

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-web`,
      env: [app_envs].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: `node --max-old-space-size=412 ./packages/lite/dist/scripts/startLite.js --workspace-name=${input.defaultWorkspaceName}`,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/",
          port: 3000,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-admincli`,
      env: [app_envs].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: `tail -f /dev/null`,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/",
          port: 3000,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-clickhouse`,
      env: [
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
          name: "clickhouse_data",
          mountPath: "/var/lib/clickhouse",
        },
        {
          type: "volume",
          name: "clickhouse_logs",
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
        `MINIO_ROOT_USER=${input.minioUser}`,
        `MINIO_ROOT_PASSWORD=${input.minioPassword}`,
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
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-temporal`,
      env: [
        `DB=postgresql`,
        `DB_PORT=5432`,
        `POSTGRES_USER=postgres`,
        `POSTGRES_PWD=${databasePassword}`,
        `POSTGRES_SEEDS=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `DYNAMIC_CONFIG_FILE_PATH=config/dynamicconfig/prod.yaml`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.temporalImage,
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
          type: "file",
          content: "",
          mountPath: "/etc/temporal/config/dynamicconfig/prod.yaml",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-temporal-ui`,
      env: [
        `TEMPORAL_ADDRESS=$(PROJECT_NAME)_${input.appServiceName}-temporal:7233`,
        `TEMPORAL_CORS_ORIGINS=https://$(PRIMARY_DOMAIN)`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.temporalUiImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/",
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "file",
          content: "",
          mountPath: "/etc/temporal/config/dynamicconfig/prod.yaml",
        },
      ],
    },
  });

  return { services };
}
