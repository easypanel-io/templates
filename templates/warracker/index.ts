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
  const appSecretKey = randomString(32);

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  const envVars = [
    `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
    `DB_PORT=5432`,
    `DB_NAME=$(PROJECT_NAME)`,
    `DB_USER=postgres`,
    `DB_PASSWORD=${databasePassword}`,
    `SMTP_HOST=${input.smtpHost}`,
    `SMTP_PORT=${input.smtpPort}`,
    `SMTP_USERNAME=${input.smtpUsername}`,
    `SMTP_PASSWORD=${input.smtpPassword}`,
    `SECRET_KEY=${appSecretKey}`,
    `MAX_UPLOAD_MB=${input.maxUploadMb}`,
    `NGINX_MAX_BODY_SIZE_VALUE=${input.maxUploadMb}M`,
    `FRONTEND_URL=https://$(PRIMARY_DOMAIN)`,
    `APP_BASE_URL=https://$(PRIMARY_DOMAIN)`,
    `WARRACKER_MEMORY_MODE=${input.memoryMode}`,
    `PYTHONUNBUFFERED=1`,
  ];

  if (input.enableOidc) {
    envVars.push(
      `OIDC_PROVIDER_NAME=${input.oidcProviderName}`,
      `OIDC_CLIENT_ID=${input.oidcClientId}`,
      `OIDC_CLIENT_SECRET=${input.oidcClientSecret}`,
      `OIDC_ISSUER_URL=${input.oidcIssuerUrl}`,
      `OIDC_SCOPE=${input.oidcScope}`
    );
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: envVars.join("\n"),
      mounts: [
        {
          type: "volume",
          name: "uploads",
          mountPath: "/data/uploads",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
    },
  });

  return { services };
}
