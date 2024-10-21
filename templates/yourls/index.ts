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
        `YOURLS_DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `YOURLS_DB_NAME=$(PROJECT_NAME)`,
        `YOURLS_DB_USER=mysql`,
        `YOURLS_DB_PASS=${databasePassword}`,
        `YOURLS_SITE=https://$(PRIMARY_DOMAIN)`,
        `YOURLS_USER=admin`,
        `YOURLS_PASS=admin123`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/admin",
          port: 80,
        },
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
