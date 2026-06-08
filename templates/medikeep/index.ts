import {
  Output,
  Services,
  randomPassword,
  randomString,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const secretKey = input.secretKey || randomString(32);
  const adminPassword = input.adminDefaultPassword || randomPassword();

  const appEnv = [
    `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
    `DB_PORT=5432`,
    `DB_NAME=$(PROJECT_NAME)`,
    `DB_USER=postgres`,
    `DB_PASSWORD=${databasePassword}`,
    `SECRET_KEY=${secretKey}`,
    `ADMIN_DEFAULT_PASSWORD=${adminPassword}`,
    `TZ=${input.timezone}`,
    `LOG_LEVEL=${input.logLevel}`,
    `SSO_ENABLED=${input.ssoEnabled}`,
  ];

  if (input.ssoEnabled) {
    if (input.ssoProviderType) {
      appEnv.push(`SSO_PROVIDER_TYPE=${input.ssoProviderType}`);
    }
    if (input.ssoClientId) {
      appEnv.push(`SSO_CLIENT_ID=${input.ssoClientId}`);
    }
    if (input.ssoClientSecret) {
      appEnv.push(`SSO_CLIENT_SECRET=${input.ssoClientSecret}`);
    }
    if (input.ssoIssuerUrl) {
      appEnv.push(`SSO_ISSUER_URL=${input.ssoIssuerUrl}`);
    }
    if (input.ssoRedirectUri) {
      appEnv.push(`SSO_REDIRECT_URI=${input.ssoRedirectUri}`);
    }
    if (input.ssoAllowedDomains) {
      appEnv.push(`SSO_ALLOWED_DOMAINS=${input.ssoAllowedDomains}`);
    }
  }

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
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      env: appEnv.join("\n"),
      mounts: [
        {
          type: "volume",
          name: "uploads",
          mountPath: "/app/uploads",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/app/logs",
        },
        {
          type: "volume",
          name: "backups",
          mountPath: "/app/backups",
        },
      ],
    },
  });

  return { services };
}
