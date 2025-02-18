import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `DJANGO_DB=default`,
        `POSTGRE_NAME=$(PROJECT_NAME)`,
        `POSTGRE_USER=postgres`,
        `POSTGRE_PASSWORD=${databasePassword}`,
        `POSTGRE_PORT=5432`,
        `POSTGRE_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `LABEL_STUDIO_HOST=https://$(EASYPANEL_DOMAIN)`,
        `SSRF_PROTECTION_ENABLED=true`,
        `LABEL_STUDIO_DISABLE_SIGNUP_WITHOUT_LINK=true`,
        `DATA_UPLOAD_MAX_NUMBER_FILES=1000`,
        `LABEL_STUDIO_USERNAME=${input.labelStudioUsername}`,
        `LABEL_STUDIO_PASSWORD=${input.labelStudioPassword}`,
        `CSRF_TRUSTED_ORIGINS=https://$(EASYPANEL_DOMAIN)`,
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
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  return { services };
}
