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
        `REDMINE_DB_MYSQL=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `REDMINE_DB_PORT=3306`,
        `REDMINE_DB_USERNAME=mysql`,
        `REDMINE_DB_PASSWORD=${databasePassword}`,
        `REDMINE_DB_DATABASE=$(PROJECT_NAME)`,
        `REDMINE_SECRET_KEY_BASE=supersecretkey`,
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
    type: "mysql",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
