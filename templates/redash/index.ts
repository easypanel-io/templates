import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secretKey = randomString(32);
  const cookieSecret = randomString(32);
  const redisPassword = randomPassword();
  const postgresPassword = randomPassword();
  const postgresServiceName = `${input.appServiceName}-db`;
  const redisServiceName = `${input.appServiceName}-redis`;

  const transportValue =
    input.mailTransport !== "NONE"
      ? `REDASH_MAIL_USE_${input.mailTransport}=true`
      : "";

  const commonEnv = [
    "PYTHONUNBUFFERED=0",
    "REDASH_LOG_LEVEL=INFO",
    `REDASH_SECRET_KEY=${secretKey}`,
    `REDASH_COOKIE_SECRET=${cookieSecret}`,
    `REDASH_REDIS_URL=redis://:${redisPassword}@$(PROJECT_NAME)_${redisServiceName}:6379/0`,
    `REDASH_DATABASE_URL=postgres://postgres:${postgresPassword}@$(PROJECT_NAME)_${postgresServiceName}:5432/$(PROJECT_NAME)`,
    `REDASH_MAIL_SERVER=${input.mailServer}`,
    `REDASH_MAIL_PORT=${input.mailPort}`,
    `REDASH_MAIL_USERNAME=${input.mailUser}`,
    `REDASH_MAIL_PASSWORD=${input.mailPassword}`,
    transportValue,
  ].filter(Boolean);

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
          port: 5000,
        },
      ],
      env: [...commonEnv, "REDASH_WEB_WORKERS=4"].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "redash_app_data",
          mountPath: "/app",
        },
      ],
      deploy: {
        command:
          "/usr/local/bin/python /app/manage.py database create_tables && /app/bin/docker-entrypoint server",
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-scheduler`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [...commonEnv, "QUEUES=celery", "WORKERS_COUNT=1"].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "redash_app_data",
          mountPath: "/app",
        },
      ],
      deploy: {
        command: "/app/bin/docker-entrypoint scheduler",
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-scheduled-worker`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        ...commonEnv,
        "QUEUES=scheduled_queries,schemas",
        "WORKERS_COUNT=1",
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "redash_app_data",
          mountPath: "/app",
        },
      ],
      deploy: {
        command: "/app/bin/docker-entrypoint worker",
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-adhoc-worker`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [...commonEnv, "QUEUES=queries", "WORKERS_COUNT=2"].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "redash_app_data",
          mountPath: "/app",
        },
      ],
      deploy: {
        command: "/app/bin/docker-entrypoint worker",
      },
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: redisServiceName,
      password: redisPassword,
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: postgresServiceName,
      password: postgresPassword,
    },
  });

  return { services };
}
