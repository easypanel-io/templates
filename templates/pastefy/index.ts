import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "mariadb",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `HTTP_SERVER_PORT=80`,
        `HTTP_SERVER_CORS=*`,
        `DATABASE_DRIVER=mysql`,
        `DATABASE_NAME=$(PROJECT_NAME)`,
        `DATABASE_USER=mariadb`,
        `DATABASE_PASSWORD=${databasePassword}`,
        `DATABASE_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `DATABASE_PORT=3306`,
        `SERVER_NAME=https://$(PRIMARY_DOMAIN)`,
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

  return { services };
}
