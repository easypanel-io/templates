import { randomBytes } from "crypto";
import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const databaseServiceName = `${input.appServiceName}-db`;
  const databasePassword = randomPassword();
  const blobTokenSecretKey = randomBytes(32).toString("base64");
  const installationId = randomBytes(16).toString("hex");
  const secretKeyBase = randomBytes(32).toString("hex");
  const systemSettingsEncryptionKeys = randomBytes(32).toString("hex");

  const smtpEnv = input.smtpServer
    ? [
        `SMTP_SERVER=${input.smtpServer}`,
        `SMTP_PORT=${input.smtpPort || 587}`,
        `SMTP_USERNAME=${input.smtpUsername || ""}`,
        `SMTP_PASSWORD=${input.smtpPassword || ""}`,
        `SMTP_SSL=${input.smtpSsl ? "true" : "false"}`,
      ]
    : [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command:
          "/opt/operately/bin/create_db; /opt/operately/bin/migrate && /opt/operately/bin/server",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 4000,
        },
      ],
      env: [
        `MIX_ENV=prod`,
        // The image only pre-chowns /media to its non-root user, so
        // CERT_DB_DIR has to live under it rather than its own volume,
        // which Docker would otherwise create root-owned and unwritable.
        `CERT_DB_DIR=/media/certs`,
        `DB_HOST=$(PROJECT_NAME)_${databaseServiceName}`,
        `DATABASE_URL=ecto://postgres:${databasePassword}@$(PROJECT_NAME)_${databaseServiceName}/operately`,
        `OPERATELY_HOST=$(PRIMARY_DOMAIN)`,
        `OPERATELY_URL_SCHEME=https`,
        `OPERATELY_BLOB_TOKEN_SECRET_KEY=${blobTokenSecretKey}`,
        `OPERATELY_INSTALLATION_ID=${installationId}`,
        `SECRET_KEY_BASE=${secretKeyBase}`,
        `SYSTEM_SETTINGS_ENCRYPTION_KEYS=${systemSettingsEncryptionKeys}`,
        `CERT_DOMAIN=`,
        `CERT_AUTO_RENEW=no`,
        `CERT_EMAILS=`,
        `ALLOW_LOGIN_WITH_EMAIL=yes`,
        `ALLOW_SIGNUP_WITH_EMAIL=${input.allowSignupWithEmail ? "yes" : "no"}`,
        `OPERATELY_BEACON_ENABLED=true`,
        ...smtpEnv,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "media",
          mountPath: "/media",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
