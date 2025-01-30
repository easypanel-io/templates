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
        `ORANGEHRM_DATABASE_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `ORANGEHRM_DATABASE_USER=mariadb`,
        `ORANGEHRM_DATABASE_PASSWORD=${databasePassword}`,
        `ORANGEHRM_DATABASE_NAME=$(PROJECT_NAME)`,
        `PUID=998`,
        `PGID=100`,
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
    type: "mariadb",
    data: {
      image: "mariadb:10.4",
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  return { services };
}
