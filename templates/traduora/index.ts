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
        `TR_DB_TYPE=mysql`,
        `TR_DB_USER=mysql`,
        `TR_DB_PASSWORD=${databasePassword}`,
        `TR_DB_DATABASE=$(PROJECT_NAME)`,
        `TR_DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `TR_DB_PORT=3306`,
        `NODE_ENV=development`,
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
    },
  });

  services.push({
    type: "mysql",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  return { services };
}
