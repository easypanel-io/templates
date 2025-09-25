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
  const secretKey = randomString(16);

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
          port: 3000,
        },
      ],
      env: [
        `POSTGRES_USER=postgres`,
        `POSTGRES_PASSWORD=${databasePassword}`,
        `POSTGRES_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `BASE_URL=https://$(PRIMARY_DOMAIN)`,
        `SECRET_KEY_BASE=${secretKey}`,
        `EMAIL_DELIVERY_METHOD=${input.emailDeliveryMethod}`,
        `EMAIL_SMTP_HOST=${input.emailSmtpHost}`,
        `EMAIL_SMTP_PORT=${input.emailSmtpPort}`,
        `EMAIL_SMTP_USER=${input.emailSmtpUser}`,
        `EMAIL_SMTP_PASS=${input.emailSmtpPass}`,
        `RAILS_LOG_TO_STDOUT=false`,
      ].join("\n"),
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
