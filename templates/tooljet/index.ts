import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const postgresPassword = randomPassword();
  const temporalPassword = randomPassword();
  const redisPassword = randomPassword();
  const randomSecretBase = randomString(64);
  const randomJwtSecret = randomString(64);
  const lockboxMasterKey = randomString(64);

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-postgres`,
      password: postgresPassword,
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-temporal-postgres`,
      password: temporalPassword,
    },
  });

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
      serviceName: `${input.appServiceName}-temporal`,
      source: {
        type: "image",
        image: input.temporalImage || "temporalio/auto-setup:1.25.1",
      },
      env: [
        "DB=postgres12",
        "DB_PORT=5432",
        "POSTGRES_USER=temporal",
        `POSTGRES_PWD=${temporalPassword}`,
        `POSTGRES_SEEDS=$(PROJECT_NAME)_${input.appServiceName}-temporal-postgres`,
      ].join("\n"),
      deploy: {
        command: "temporal server start-dev",
      },
    },
  });

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
          port: 80,
        },
      ],
      env: [
        "NODE_ENV=production",
        "SERVE_CLIENT=true",
        "PORT=80",
        `TOOLJET_HOST=https://$(EASYPANEL_DOMAIN)`,
        `LOCKBOX_MASTER_KEY=${lockboxMasterKey}`,
        `SECRET_KEY_BASE=${randomSecretBase}`,
        `ORM_LOGGING=all`,
        `PG_DB=$(PROJECT_NAME)`,
        `PG_USER=postgres`,
        `PG_HOST=$(PROJECT_NAME)_${input.appServiceName}-postgres`,
        `PG_PASS=${postgresPassword}`,
        `TOOLJET_DB=tooljet-db`,
        `TOOLJET_DB_USER=postgres`,
        `TOOLJET_DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-postgres`,
        `TOOLJET_DB_PASS=${postgresPassword}`,
        `PGRST_DB_URI=postgres://postgres:${postgresPassword}@$(PROJECT_NAME)_${input.appServiceName}-postgres/$(PROJECT_NAME)`,
        `PGRST_HOST=$(PROJECT_NAME)_${input.appServiceName}-postgres:5432`,
        `PGRST_JWT_SECRET=${randomJwtSecret}`,
        `PGRST_SERVER_PORT=3002`,
        `REDIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
        "REDIS_PORT=6379",
        "REDIS_USER=default",
        `REDIS_PASSWORD=${redisPassword}`,
        "CHECK_FOR_UPDATES=true",
        "ENABLE_MULTIPLAYER_EDITING=true",
        "ENABLE_MARKETPLACE_FEATURE=true",
        "USER_SESSION_EXPIRY=2880",
        "DEPLOYMENT_PLATFORM=docker",
        "ENABLE_WORKFLOW_SCHEDULING=true",
        `TEMPORAL_SERVER_ADDRESS=$(PROJECT_NAME)_${input.appServiceName}-temporal:7233`,
        "TEMPORAL_TASK_QUEUE_NAME_FOR_WORKFLOWS=tooljet-workflows",
        "TOOLJET_WORKFLOWS_TEMPORAL_NAMESPACE=default",
        "DISABLE_TOOLJET_TELEMETRY=false",
        "DEFAULT_FROM_EMAIL=hello@tooljet.io",
      ].join("\n"),
      deploy: {
        command: "npm run db:setup:prod && npm run start:prod",
      },
    },
  });

  return { services };
}
