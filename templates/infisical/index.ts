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

  const encryptionKey = randomString(32);
  const authSecret = randomString(32);
  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-migration`,
      env: [
        `ENCRYPTION_KEY=${encryptionKey}`,
        `AUTH_SECRET=${authSecret}`,
        `DB_CONNECTION_URI=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
        `REDIS_URL=redis://default:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379/0`,
        `SITE_URL=http://localhost:8080`,
        `SMTP_HOST=`,
        `SMTP_PORT=`,
        `SMTP_NAME=`,
        `SMTP_USERNAME=`,
        `SMTP_PASSWORD=`,
        `CLIENT_ID_HEROKU=`,
        `CLIENT_ID_VERCEL=`,
        `CLIENT_ID_NETLIFY=`,
        `CLIENT_ID_GITHUB=`,
        `CLIENT_ID_GITHUB_APP=`,
        `CLIENT_SLUG_GITHUB_APP=`,
        `CLIENT_ID_GITLAB=`,
        `CLIENT_ID_BITBUCKET=`,
        `CLIENT_SECRET_HEROKU=`,
        `CLIENT_SECRET_VERCEL=`,
        `CLIENT_SECRET_NETLIFY=`,
        `CLIENT_SECRET_GITHUB=`,
        `CLIENT_SECRET_GITHUB_APP=`,
        `CLIENT_SECRET_GITLAB=`,
        `CLIENT_SECRET_BITBUCKET=`,
        `CLIENT_SLUG_VERCEL=`,
        `CLIENT_PRIVATE_KEY_GITHUB_APP=`,
        `CLIENT_APP_ID_GITHUB_APP=`,
        `SENTRY_DSN=`,
        `POSTHOG_HOST=`,
        `POSTHOG_PROJECT_API_KEY=`,
        `CLIENT_ID_GOOGLE_LOGIN=`,
        `CLIENT_SECRET_GOOGLE_LOGIN=`,
        `CLIENT_ID_GITHUB_LOGIN=`,
        `CLIENT_SECRET_GITHUB_LOGIN=`,
        `CLIENT_ID_GITLAB_LOGIN=`,
        `CLIENT_SECRET_GITLAB_LOGIN=`,
        `CAPTCHA_SECRET=`,
        `NEXT_PUBLIC_CAPTCHA_SITE_KEY=`,
        `OTEL_TELEMETRY_COLLECTION_ENABLED=false`,
        `OTEL_EXPORT_TYPE=prometheus`,
        `OTEL_EXPORT_OTLP_ENDPOINT=`,
        `OTEL_OTLP_PUSH_INTERVAL=`,
        `OTEL_COLLECTOR_BASIC_AUTH_USERNAME=`,
        `OTEL_COLLECTOR_BASIC_AUTH_PASSWORD=`,
        `PLAIN_API_KEY=`,
        `PLAIN_WISH_LABEL_IDS=`,
        `SSL_CLIENT_CERTIFICATE_HEADER_KEY=`,
        `ENABLE_MSSQL_SECRET_ROTATION_ENCRYPT=true`,
        `INF_APP_CONNECTION_AWS_ACCESS_KEY_ID=`,
        `INF_APP_CONNECTION_AWS_SECRET_ACCESS_KEY=`,
        `INF_APP_CONNECTION_GITHUB_OAUTH_CLIENT_ID=`,
        `INF_APP_CONNECTION_GITHUB_OAUTH_CLIENT_SECRET=`,
        `INF_APP_CONNECTION_GITHUB_APP_CLIENT_ID=`,
        `INF_APP_CONNECTION_GITHUB_APP_CLIENT_SECRET=`,
        `INF_APP_CONNECTION_GITHUB_APP_PRIVATE_KEY=`,
        `INF_APP_CONNECTION_GITHUB_APP_SLUG=`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: "npm run migration:latest",
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-web`,
      env: [
        `NODE_ENV=production`,
        `ENCRYPTION_KEY=${encryptionKey}`,
        `AUTH_SECRET=${authSecret}`,
        `DB_CONNECTION_URI=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
        `REDIS_URL=redis://default:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379/0`,
        `SITE_URL=http://localhost:8080`,
        `SMTP_HOST=`,
        `SMTP_PORT=`,
        `SMTP_NAME=`,
        `SMTP_USERNAME=`,
        `SMTP_PASSWORD=`,
        `CLIENT_ID_HEROKU=`,
        `CLIENT_ID_VERCEL=`,
        `CLIENT_ID_NETLIFY=`,
        `CLIENT_ID_GITHUB=`,
        `CLIENT_ID_GITHUB_APP=`,
        `CLIENT_SLUG_GITHUB_APP=`,
        `CLIENT_ID_GITLAB=`,
        `CLIENT_ID_BITBUCKET=`,
        `CLIENT_SECRET_HEROKU=`,
        `CLIENT_SECRET_VERCEL=`,
        `CLIENT_SECRET_NETLIFY=`,
        `CLIENT_SECRET_GITHUB=`,
        `CLIENT_SECRET_GITHUB_APP=`,
        `CLIENT_SECRET_GITLAB=`,
        `CLIENT_SECRET_BITBUCKET=`,
        `CLIENT_SLUG_VERCEL=`,
        `CLIENT_PRIVATE_KEY_GITHUB_APP=`,
        `CLIENT_APP_ID_GITHUB_APP=`,
        `SENTRY_DSN=`,
        `POSTHOG_HOST=`,
        `POSTHOG_PROJECT_API_KEY=`,
        `CLIENT_ID_GOOGLE_LOGIN=`,
        `CLIENT_SECRET_GOOGLE_LOGIN=`,
        `CLIENT_ID_GITHUB_LOGIN=`,
        `CLIENT_SECRET_GITHUB_LOGIN=`,
        `CLIENT_ID_GITLAB_LOGIN=`,
        `CLIENT_SECRET_GITLAB_LOGIN=`,
        `CAPTCHA_SECRET=`,
        `NEXT_PUBLIC_CAPTCHA_SITE_KEY=`,
        `OTEL_TELEMETRY_COLLECTION_ENABLED=false`,
        `OTEL_EXPORT_TYPE=prometheus`,
        `OTEL_EXPORT_OTLP_ENDPOINT=`,
        `OTEL_OTLP_PUSH_INTERVAL=`,
        `OTEL_COLLECTOR_BASIC_AUTH_USERNAME=`,
        `OTEL_COLLECTOR_BASIC_AUTH_PASSWORD=`,
        `PLAIN_API_KEY=`,
        `PLAIN_WISH_LABEL_IDS=`,
        `SSL_CLIENT_CERTIFICATE_HEADER_KEY=`,
        `ENABLE_MSSQL_SECRET_ROTATION_ENCRYPT=true`,
        `INF_APP_CONNECTION_AWS_ACCESS_KEY_ID=`,
        `INF_APP_CONNECTION_AWS_SECRET_ACCESS_KEY=`,
        `INF_APP_CONNECTION_GITHUB_OAUTH_CLIENT_ID=`,
        `INF_APP_CONNECTION_GITHUB_OAUTH_CLIENT_SECRET=`,
        `INF_APP_CONNECTION_GITHUB_APP_CLIENT_ID=`,
        `INF_APP_CONNECTION_GITHUB_APP_CLIENT_SECRET=`,
        `INF_APP_CONNECTION_GITHUB_APP_PRIVATE_KEY=`,
        `INF_APP_CONNECTION_GITHUB_APP_SLUG=`,
      ].join("\n"),
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
