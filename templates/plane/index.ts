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
  const randomPasswordPostgres = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `SECRET_KEY_BASE=`,
        `FRONTEND_URL=https://$(PRIMARY_DOMAIN)`,
        `DEFAULT_LOCALE=${input.defaultLocale}`,
        `FORCE_SSL=true`,
        `ENABLE_ACCOUNT_SIGNUP=true`,
        `REDIS_URL=redis://default@$(PROJECT_NAME)_${input.redisServiceName}:6379`,
        `REDIS_PASSWORD=${randomPasswordRedis}`,
        `REDIS_OPENSSL_VERIFY_MODE=none`,
        `POSTGRES_DATABASE=$(PROJECT_NAME)`,
        `POSTGRES_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `POSTGRES_USERNAME=postgres`,
        `POSTGRES_PASSWORD=${randomPasswordPostgres}`,
        `RAILS_MAX_THREADS=5`,
        `NODE_ENV=production`,
        `RAILS_ENV=production`,
        `INSTALLATION_ENV=docker`,
        `# Frontend`,
        `# Extra image domains that need to be added for Next Image`,
        `NEXT_PUBLIC_EXTRA_IMAGE_DOMAINS=`,
        `# Google Client ID for Google OAuth`,
        `NEXT_PUBLIC_GOOGLE_CLIENTID=""`,
        `# Github ID for Github OAuth`,
        `NEXT_PUBLIC_GITHUB_ID=""`,
        `# Github App Name for GitHub Integration`,
        `NEXT_PUBLIC_GITHUB_APP_NAME=""`,
        `# Sentry DSN for error monitoring`,
        `NEXT_PUBLIC_SENTRY_DSN=""`,
        `# Enable/Disable OAUTH - default 0 for selfhosted instance `,
        `NEXT_PUBLIC_ENABLE_OAUTH=0`,
        `# Enable/Disable sentry`,
        `NEXT_PUBLIC_ENABLE_SENTRY=0`,
        `# Enable/Disable session recording `,
        `NEXT_PUBLIC_ENABLE_SESSION_RECORDER=0`,
        `# Enable/Disable event tracking`,
        `NEXT_PUBLIC_TRACK_EVENTS=0`,
        `# Slack for Slack Integration`,
        `NEXT_PUBLIC_SLACK_CLIENT_ID=""`,
        `# Backend`,
        `# Debug value for api server use it as 0 for production use`,
        `DEBUG=0`,
        `# Error logs`,
        `SENTRY_DSN=""`,
        `# Database Settings`,
        `PGUSER="plane"`,
        `PGPASSWORD="plane"`,
        `PGHOST="plane-db"`,
        `PGDATABASE="plane"`,
        `DATABASE_URL=postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}
        `# Redis Settings`,
        `REDIS_HOST="plane-redis"`,
        `REDIS_PORT="6379"`,
        `REDIS_URL="redis://${REDIS_HOST}:6379/"`,
        `# Email Settings`,
        `EMAIL_HOST=""`,
        `EMAIL_HOST_USER=""`,
        `EMAIL_HOST_PASSWORD=""`,
        `EMAIL_PORT=587`,
        `EMAIL_FROM="Team Plane <team@mailer.plane.so>"`,
        `EMAIL_USE_TLS="1"`,
        `EMAIL_USE_SSL="0"`,
        `# Changing this requires change in the nginx.conf for uploads if using minio setup`,
        `AWS_S3_BUCKET_NAME="uploads"`,
        `# Maximum file upload limit`,
        `FILE_SIZE_LIMIT=5242880`,
        `# GPT settings`,
        `OPENAI_API_KEY=""`,
        `GPT_ENGINE=""`,
        `# Github`,
        `GITHUB_CLIENT_SECRET="" # For fetching release notes`,
        `# Settings related to Docker`,
        `DOCKERIZED=1`,
        `# set to 1 If using the pre-configured minio setup `,
        `USE_MINIO=1`,
        `# Nginx Configuration`,
        `NGINX_PORT=80`,
        `# Default Creds`,
        `DEFAULT_EMAIL="captain@plane.so"`,
        `DEFAULT_PASSWORD="password123"`,
        `# SignUps`,
        `ENABLE_SIGNUP="1"`,
        `# Auto generated and Required that will be generated from setup.sh`,
        `NEXT_PUBLIC_API_BASE_URL=http://<your_ip|domain_name>`,
        `SECRET_KEY=${secretkey}`,
        `WEB_URL=http://<your_ip|domain_name>`
      ].join("\n"),
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
      deploy: {
        command:
          "bundle exec rails db:chatwoot_prepare && bundle exec rails s -p 3000 -b 0.0.0.0",
      },
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
      password: randomPasswordRedis,
    },
  });

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      image: "postgres:12",
      password: randomPasswordPostgres,
    },
  });

  return { services };
}
