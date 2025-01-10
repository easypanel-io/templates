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
  const lightdashSecert = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `PGHOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `PGPORT=5432`,
        `PGUSER=postgres`,
        `PGPASSWORD=${databasePassword}`,
        `PGDATABASE=$(PROJECT_NAME)`,
        `SECURE_COOKIES=false`,
        `TRUST_PROXY=false`,
        `LIGHTDASH_SECRET=${lightdashSecert}`,
        `PORT=8080`,
        `LIGHTDASH_LOG_LEVEL=debug`,
        `LIGHTDASH_INSTALL_ID=`,
        `LIGHTDASH_INSTALL_TYPE=docker_image`,
        `AUTH_DISABLE_PASSWORD_AUTHENTICATION=false`,
        `AUTH_ENABLE_GROUP_SYNC=false`,
        `AUTH_GOOGLE_ENABLED=false`,
        `AUTH_GOOGLE_OAUTH2_CLIENT_ID=`,
        `AUTH_GOOGLE_OAUTH2_CLIENT_SECRET=`,
        `SITE_URL=https://$(PRIMARY_DOMAIN)`,
        `EMAIL_SMTP_HOST=`,
        `EMAIL_SMTP_PORT=`,
        `EMAIL_SMTP_SECURE=false`,
        `EMAIL_SMTP_USER=`,
        `EMAIL_SMTP_PASSWORD=`,
        `EMAIL_SMTP_ALLOW_INVALID_CERT=false`,
        `EMAIL_SMTP_SENDER_NAME="Lightdash"`,
        `EMAIL_SMTP_SENDER_EMAIL=`,
        `ALLOW_MULTIPLE_ORGS=false`,
        `LIGHTDASH_QUERY_MAX_LIMIT=5000`,
        `LIGHTDASH_MAX_PAYLOAD=5mb`,
        `HEADLESS_BROWSER_HOST=$(PROJECT_NAME)_${input.appServiceName}-browserless`,
        `HEADLESS_BROWSER_PORT=3000`,
        `RUDDERSTACK_WRITE_KEY=`,
        `SCHEDULER_ENABLED=true`,
        `GROUPS_ENABLED=false`,
        `POSTHOG_PROJECT_API_KEY=`,
        `POSTHOG_FE_API_HOST=`,
        `POSTHOG_BE_API_HOST=`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "dbt",
          mountPath: "/usr/app/dbt",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-browserless`,
      source: {
        type: "image",
        image: `${input.browserlessImage}`,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
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

  return { services };
}
