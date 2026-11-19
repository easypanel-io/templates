import { randomBytes } from "crypto";
import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const mailhogServiceName = `${input.appServiceName}-mailhog`;
  const postgresPassword = randomPassword();
  const secretKeyBase = randomBytes(64).toString("base64");
  const dataEncryptionKey = randomBytes(48).toString("base64");

  const emailEnv = input.smtpHost
    ? [
        `EMAIL_ADAPTER=smtp`,
        `SMTP_HOST=${input.smtpHost}`,
        `SMTP_PORT=${input.smtpPort || 587}`,
        `SMTP_USERNAME=${input.smtpUsername || ""}`,
        `SMTP_PASSWORD=${input.smtpPassword || ""}`,
      ]
    : [
        `EMAIL_ADAPTER=smtp`,
        `SMTP_HOST=$(PROJECT_NAME)_${mailhogServiceName}`,
        `SMTP_PORT=1025`,
        `SMTP_USERNAME=mailhog`,
        `SMTP_PASSWORD=mailhog`,
      ];

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
          port: 4000,
        },
      ],
      env: [
        `DEPLOYMENT_TYPE=docker`,
        `PHX_HOST=$(PRIMARY_DOMAIN)`,
        `SECRET_KEY_BASE=${secretKeyBase}`,
        `DATA_ENCRYPTION_KEY=${dataEncryptionKey}`,
        `POSTGRES_PASSWORD=${postgresPassword}`,
        `REGISTRATION_ENABLED=${input.registrationEnabled ? "true" : "false"}`,
        `EMAIL_FROM_ADDRESS=${input.emailFromAddress}`,
        ...emailEnv,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/app/data",
        },
        {
          type: "volume",
          name: "pg-data",
          mountPath: "/var/lib/postgresql/data",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: mailhogServiceName,
      source: {
        type: "image",
        image: "mailhog/mailhog:v1.0.1",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8025,
        },
      ],
    },
  });

  return { services };
}
