import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "postgres",
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
        `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)-${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
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

  return { services };
}
