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
        `DATABASE_URL=jdbc:postgresql://$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
        `DATABASE_ROOT_USERNAME=postgres`,
        `DATABASE_ROOT_PASSWORD=${databasePassword}`,
        `DATABASE_USERNAME=postgres`,
        `DATABASE_PASSWORD=${databasePassword}`,
        `FUSIONAUTH_APP_MEMORY=512M`,
        `FUSIONAUTH_APP_RUNTIME_MODE=production`,
        `FUSIONAUTH_APP_URL=https://$(PRIMARY_DOMAIN)`,
        `SEARCH_TYPE=database`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 9011,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/usr/local/fusionauth/config",
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
