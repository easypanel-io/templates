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
  const randomPasswordRedis = randomPassword();
  const databasePassword = randomPassword();
  const minioPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appFrontendServiceName,
      env: [
        `NODE_ENV=production`,
        `NEXT_PUBLIC_EXTRA_IMAGE_DOMAINS=`,
        `NEXT_PUBLIC_GOOGLE_CLIENTID=""`,
        `NEXT_PUBLIC_GITHUB_ID=""`,
        `NEXT_PUBLIC_GITHUB_APP_NAME=""`,
        `NEXT_PUBLIC_SENTRY_DSN=""`,
        `NEXT_PUBLIC_ENABLE_OAUTH=0`,
        `NEXT_PUBLIC_ENABLE_SENTRY=0`,
        `NEXT_PUBLIC_ENABLE_SESSION_RECORDER=0`,
        `NEXT_PUBLIC_TRACK_EVENTS=0`,
        `NEXT_PUBLIC_SLACK_CLIENT_ID=""`,
        `DEBUG=0`,
        `SENTRY_DSN=""`,
        `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`,
        `REDIS_URL="redis://${input.databaseServiceName}:6379/"`,
        `EMAIL_HOST=""`,
        `EMAIL_HOST_USER=""`,
        `EMAIL_HOST_PASSWORD=""`,
        `EMAIL_PORT=587`,
        `EMAIL_FROM="Team Plane <team@mailer.plane.so>"`,
        `EMAIL_USE_TLS="1"`,
        `EMAIL_USE_SSL="0"`,
        `AWS_S3_BUCKET_NAME="uploads"`,
        `FILE_SIZE_LIMIT=5242880`,
        `OPENAI_API_KEY=""`,
        `GPT_ENGINE=""`,
        `GITHUB_CLIENT_SECRET=`,
        `DOCKERIZED=1`,
        `USE_MINIO=1`,
        `NGINX_PORT=80`,
        `DEFAULT_EMAIL="captain@plane.so"`,
        `DEFAULT_PASSWORD="password123"`,
        `ENABLE_SIGNUP="1"`,
        `NEXT_PUBLIC_API_BASE_URL=https://$(PRIMARY_DOMAIN)`,
        `SECRET_KEY=${secretkey}`,
        `WEB_URL=https://$(PRIMARY_DOMAIN)`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appFrontendServiceName,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data/storage",
        },
        {
          type: "volume",
          name: "app",
          mountPath: "/app/storage",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appBackendServiceName,
      env: [
        `NODE_ENV=production`,
        `NEXT_PUBLIC_EXTRA_IMAGE_DOMAINS=`,
        `NEXT_PUBLIC_GOOGLE_CLIENTID=""`,
        `NEXT_PUBLIC_GITHUB_ID=""`,
        `NEXT_PUBLIC_GITHUB_APP_NAME=""`,
        `NEXT_PUBLIC_SENTRY_DSN=""`,
        `NEXT_PUBLIC_ENABLE_OAUTH=0`,
        `NEXT_PUBLIC_ENABLE_SENTRY=0`,
        `NEXT_PUBLIC_ENABLE_SESSION_RECORDER=0`,
        `NEXT_PUBLIC_TRACK_EVENTS=0`,
        `NEXT_PUBLIC_SLACK_CLIENT_ID=""`,
        `DEBUG=0`,
        `SENTRY_DSN=""`,
        `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`,
        `REDIS_URL="redis://${input.databaseServiceName}:6379/"`,
        `EMAIL_HOST=""`,
        `EMAIL_HOST_USER=""`,
        `EMAIL_HOST_PASSWORD=""`,
        `EMAIL_PORT=587`,
        `EMAIL_FROM="Team Plane <team@mailer.plane.so>"`,
        `EMAIL_USE_TLS="1"`,
        `EMAIL_USE_SSL="0"`,
        `AWS_S3_BUCKET_NAME="uploads"`,
        `FILE_SIZE_LIMIT=5242880`,
        `OPENAI_API_KEY=""`,
        `GPT_ENGINE=""`,
        `GITHUB_CLIENT_SECRET=`,
        `DOCKERIZED=1`,
        `USE_MINIO=1`,
        `NGINX_PORT=80`,
        `DEFAULT_EMAIL="captain@plane.so"`,
        `DEFAULT_PASSWORD="password123"`,
        `ENABLE_SIGNUP="1"`,
        `NEXT_PUBLIC_API_BASE_URL=https://$(PRIMARY_DOMAIN)`,
        `SECRET_KEY=${secretkey}`,
        `WEB_URL=https://$(PRIMARY_DOMAIN)`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appBackendServiceName,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data/storage",
        },
        {
          type: "volume",
          name: "app",
          mountPath: "/app/storage",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appWorkerServiceName,
      env: [
        `NODE_ENV=production`,
        `NEXT_PUBLIC_EXTRA_IMAGE_DOMAINS=`,
        `NEXT_PUBLIC_GOOGLE_CLIENTID=""`,
        `NEXT_PUBLIC_GITHUB_ID=""`,
        `NEXT_PUBLIC_GITHUB_APP_NAME=""`,
        `NEXT_PUBLIC_SENTRY_DSN=""`,
        `NEXT_PUBLIC_ENABLE_OAUTH=0`,
        `NEXT_PUBLIC_ENABLE_SENTRY=0`,
        `NEXT_PUBLIC_ENABLE_SESSION_RECORDER=0`,
        `NEXT_PUBLIC_TRACK_EVENTS=0`,
        `NEXT_PUBLIC_SLACK_CLIENT_ID=""`,
        `DEBUG=0`,
        `SENTRY_DSN=""`,
        `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`,
        `REDIS_URL="redis://${input.databaseServiceName}:6379/"`,
        `EMAIL_HOST=""`,
        `EMAIL_HOST_USER=""`,
        `EMAIL_HOST_PASSWORD=""`,
        `EMAIL_PORT=587`,
        `EMAIL_FROM="Team Plane <team@mailer.plane.so>"`,
        `EMAIL_USE_TLS="1"`,
        `EMAIL_USE_SSL="0"`,
        `AWS_S3_BUCKET_NAME="uploads"`,
        `FILE_SIZE_LIMIT=5242880`,
        `OPENAI_API_KEY=""`,
        `GPT_ENGINE=""`,
        `GITHUB_CLIENT_SECRET=`,
        `DOCKERIZED=1`,
        `USE_MINIO=1`,
        `NGINX_PORT=80`,
        `DEFAULT_EMAIL="captain@plane.so"`,
        `DEFAULT_PASSWORD="password123"`,
        `ENABLE_SIGNUP="1"`,
        `NEXT_PUBLIC_API_BASE_URL=https://$(PRIMARY_DOMAIN)`,
        `SECRET_KEY=${secretkey}`,
        `WEB_URL=https://$(PRIMARY_DOMAIN)`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appWorkerServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data/storage",
        },
        {
          type: "volume",
          name: "app",
          mountPath: "/app/storage",
        },
      ],
    },
  });

  services.push({
    type: "redis",
    data: {
      projectName: input.projectName,
      serviceName: input.redisServiceName,
      image: "redis:6.2.7",
      password: randomPasswordRedis,
    },
  });

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      image: "postgres:15.2",
      password: randomPasswordPostgres,
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.storageServiceName,
      source: { type: "image", image: input.storageServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 9001 }],
      mounts: [{ type: "volume", name: "data", mountPath: "/data" }],
      env: [
        `MINIO_ROOT_USER=minio`,
        `MINIO_ROOT_PASSWORD=${minioPassword}`,
      ].join("\n"),
    },
  });
  return { services };
}
