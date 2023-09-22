import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secretkey = randomString(64);
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `SECRET_KEY_BASE=${secretkey}`,
        `RAILS_ENV=production`,
        `RAILS_LOG_TO_STDOUT=true`,
        `RAILS_SERVE_STATIC_FILES=true`,
        `ASSET_HOST=${input.assetHost}`,
        `DATABASE_NAME=$(PROJECT_NAME)`,
        `DATABASE_USERNAME=postgres`,
        `DATABASE_PASSWORD=${databasePassword}`,
        `DATABASE_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `DATABASE_URL=postgresql://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}:5432/${DATABASE_NAME}?sslmode=require`,
        `DEFAULT_SENDER_EMAIL_ADDRESS=${input.defaultSenderEmail}`,
        `I18N_AVAILABLE_LOCALES=${input.avaliableLanguage}`,
        `I18N_DEFAULT_LOCALE=${input.defaultLanguage}`,
      ].join("\n"),
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
    },
  });

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
