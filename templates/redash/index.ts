import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secretkey = randomString(32);
  const cookieSecretkey = randomString(32);
  const randomPasswordRedis = randomPassword();
  const randomPasswordPostgres = randomPassword();
  const transportValue = input.mailTransport
    ? `REDASH_MAIL_USE_${input.mailTransport}=true`
    : "";

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      domains: input.domain ? [{ name: input.domain }] : [],
      env: [
        `PYTHONUNBUFFERED=0`,
        `REDASH_LOG_LEVEL=INFO`,
        `REDASH_SECRET_KEY=${secretkey}`,
        `REDASH_COOKIE_SECRET=${cookieSecretkey}`,
        `REDASH_REDIS_URL=redis://default:${randomPasswordRedis}@${input.projectName}_${input.redisServiceName}:6379/0`,
        `REDASH_DATABASE_URL=postgres://postgres:${randomPasswordPostgres}@${input.projectName}_${input.databaseServiceName}:5432/${input.projectName}`,
        `REDASH_WEB_WORKERS=4`,
        `REDASH_MAIL_SERVER=${input.mailServer}`,
        `REDASH_MAIL_PORT=${input.mailPort}`,
        `REDASH_MAIL_USERNAME=${input.mailUser}`,
        `REDASH_MAIL_PASSWORD=${input.mailPassword}`,
        `${transportValue}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "app-data",
          mountPath: "/app",
        },
      ],
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 5000,
        secure: true,
      },
      deploy: {
        command:
          "/usr/local/bin/python /app/manage.py database create_tables ; /app/bin/docker-entrypoint server",
      },
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: `${input.projectName}-scheduler`,
      env: [
        `PYTHONUNBUFFERED=0`,
        `REDASH_LOG_LEVEL=INFO`,
        `REDASH_SECRET_KEY=${secretkey}`,
        `REDASH_COOKIE_SECRET=${cookieSecretkey}`,
        `REDASH_REDIS_URL=redis://default:${randomPasswordRedis}@${input.projectName}_${input.redisServiceName}:6379/0`,
        `QUEUES=celery`,
        `WORKERS_COUNT=1`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      mounts: [
        {
          type: "volume",
          name: "app-data",
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
      projectName: input.projectName,
      serviceName: `${input.projectName}-scheduled_worker`,
      env: [
        `PYTHONUNBUFFERED=0`,
        `REDASH_LOG_LEVEL=INFO`,
        `REDASH_SECRET_KEY=${secretkey}`,
        `REDASH_COOKIE_SECRET=${cookieSecretkey}`,
        `REDASH_REDIS_URL=redis://default:${randomPasswordRedis}@${input.projectName}_${input.redisServiceName}:6379/0`,
        `QUEUES=scheduled_queries,schemas`,
        `WORKERS_COUNT=1`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      mounts: [
        {
          type: "volume",
          name: "app-data",
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
      projectName: input.projectName,
      serviceName: `${input.projectName}-adhoc_worker`,
      env: [
        `PYTHONUNBUFFERED=0`,
        `REDASH_LOG_LEVEL=INFO`,
        `REDASH_SECRET_KEY=${secretkey}`,
        `REDASH_COOKIE_SECRET=${cookieSecretkey}`,
        `REDASH_REDIS_URL=redis://default:${randomPasswordRedis}@${input.projectName}_${input.redisServiceName}:6379/0`,
        `QUEUES=queries`,
        `WORKERS_COUNT=2`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      mounts: [
        {
          type: "volume",
          name: "app-data",
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
      projectName: input.projectName,
      serviceName: input.redisServiceName,
      password: randomPasswordRedis,
    },
  });

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      image: "postgres:14",
      password: randomPasswordPostgres,
    },
  });

  return { services };
}
