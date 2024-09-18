import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secret = randomString(512);
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `DB_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)?sslmode=disable`,
        `DB_ENABLE_SSL=false`,
        `KEILA_USER=changeme@easypanel.io`,
        `KEILA_PASSWORD=password123`,
        `URL_HOST=$(PRIMARY_DOMAIN)`,
        `URL_SCHEMA=https`,
        `SECRET_KEY_BASE=${secret}`,
        `DISABLE_REGISTRATION=false`,
        `DISABLE_PRECEDENCE_HEADER=false`,
        `USER_CONTENT_DIR=/uploads`,
        `MAILER_SMTP_FROM_EMAIL=${input.emailFrom}`,
        `MAILER_SMTP_HOST=${input.emailHost}`,
        `MAILER_SMTP_PORT=${input.emailPort}`,
        `MAILER_SMTP_USER=${input.emailUsername}`,
        `MAILER_SMTP_PASSWORD=${input.emailPassword}`,
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
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
