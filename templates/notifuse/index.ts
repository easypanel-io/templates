import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const dbServiceName = `${input.appServiceName}-db`;
  const mailhogServiceName = `${input.appServiceName}-mailhog`;
  const dbPassword = randomPassword();
  const secretKey = randomString(64);

  const emailEnv = input.smtpHost
    ? [
        `SMTP_HOST=${input.smtpHost}`,
        `SMTP_PORT=${input.smtpPort || 587}`,
        `SMTP_USERNAME=${input.smtpUsername || ""}`,
        `SMTP_PASSWORD=${input.smtpPassword || ""}`,
        `SMTP_FROM_EMAIL=${input.smtpFromEmail}`,
        `SMTP_FROM_NAME=${input.smtpFromName}`,
      ]
    : [
        `SMTP_HOST=$(PROJECT_NAME)_${mailhogServiceName}`,
        "SMTP_PORT=1025",
        "SMTP_USERNAME=mailhog",
        "SMTP_PASSWORD=mailhog",
        `SMTP_FROM_EMAIL=${input.smtpFromEmail}`,
        `SMTP_FROM_NAME=${input.smtpFromName}`,
      ];

  services.push({
    type: "postgres",
    data: {
      serviceName: dbServiceName,
      password: dbPassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        "SERVER_PORT=8080",
        "SERVER_HOST=0.0.0.0",
        "ENVIRONMENT=production",
        `DB_HOST=$(PROJECT_NAME)_${dbServiceName}`,
        "DB_PORT=5432",
        "DB_USER=postgres",
        `DB_PASSWORD=${dbPassword}`,
        "DB_NAME=notifuse_system",
        "DB_SSLMODE=disable",
        `SECRET_KEY=${secretKey}`,
        "API_ENDPOINT=https://$(PRIMARY_DOMAIN)",
        ...emailEnv,
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
          name: "data",
          mountPath: "/app/data",
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
