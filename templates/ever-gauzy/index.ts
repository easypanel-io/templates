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
  const expressSessionSecret = randomString(48);
  const jwtRefreshSecret = randomString(48);
  const jwtVerificationSecret = randomString(48);

  const dbHost = `$(PROJECT_NAME)_${input.appServiceName}-db`;
  const webHost = `$(PROJECT_NAME)_${input.appServiceName}-web`;
  const publicApiBase = `https://$(PROJECT_NAME)-${input.appServiceName}-api.$(EASYPANEL_HOST)`;
  const publicWebBase = `https://$(PROJECT_NAME)-${input.appServiceName}-web.$(EASYPANEL_HOST)`;

  const sharedUrls = [
    `API_BASE_URL=${publicApiBase}`,
    `CLIENT_BASE_URL=${publicWebBase}`,
    `APP_LINK=${publicWebBase}`,
    `APP_EMAIL_CONFIRMATION_URL=${publicWebBase}/#/auth/confirm-email`,
    `APP_MAGIC_SIGN_URL=${publicWebBase}/#/auth/magic-sign-in`,
    `APP_LOGO=${publicWebBase}/assets/images/logos/logo_Gauzy.png`,
    `ALLOWED_ORIGINS=${publicWebBase},${publicApiBase}`,
  ];

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  const apiEnv = [
    `NODE_ENV=production`,
    `IS_DOCKER=true`,
    `API_HOST=0.0.0.0`,
    `API_PORT=3000`,
    `DB_ORM=typeorm`,
    `DB_TYPE=postgres`,
    `DB_SYNCHRONIZE=false`,
    `DB_HOST=${dbHost}`,
    `DB_PORT=5432`,
    `DB_NAME=$(PROJECT_NAME)`,
    `DB_USER=postgres`,
    `DB_PASS=${databasePassword}`,
    `DB_LOGGING=warn`,
    `DB_SSL_MODE=false`,
    `REDIS_ENABLED=false`,
    `WORKER_QUEUE_ENABLED=false`,
    `WORKER_SCHEDULER_ENABLED=false`,
    `ALLOW_SUPER_ADMIN_ROLE=true`,
    `EXPRESS_SESSION_SECRET=${expressSessionSecret}`,
    `JWT_REFRESH_TOKEN_SECRET=${jwtRefreshSecret}`,
    `JWT_VERIFICATION_TOKEN_SECRET=${jwtVerificationSecret}`,
    `PLATFORM_WEBSITE_URL=https://gauzy.co`,
    `POSTHOG_ENABLED=false`,
    `SENTRY_DSN=`,
    `SENTRY_HTTP_TRACING_ENABLED=false`,
    `SENTRY_POSTGRES_TRACKING_ENABLED=false`,
    `SENTRY_PROFILING_ENABLED=false`,
    ...sharedUrls,
  ].join("\n");

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-api`,
      source: {
        type: "image",
        image: input.apiServiceImage,
      },
      env: apiEnv,
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
    },
  });

  const webEnv = [
    `NODE_ENV=production`,
    `IS_DOCKER=true`,
    `WEB_HOST=${webHost}`,
    `WEB_PORT=4200`,
    `DEMO=false`,
    `API_HOST=0.0.0.0`,
    `API_PORT=3000`,
    `SENTRY_DSN=`,
    `SENTRY_TRACES_SAMPLE_RATE=0.1`,
    `SENTRY_PROFILE_SAMPLE_RATE=1`,
    `POSTHOG_ENABLED=false`,
    ...sharedUrls,
  ].join("\n");

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-web`,
      source: {
        type: "image",
        image: input.webServiceImage,
      },
      env: webEnv,
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 4200,
        },
      ],
    },
  });

  return { services };
}
