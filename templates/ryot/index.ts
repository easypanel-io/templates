import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const adminToken = randomPassword();

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
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      env: [
        `TZ=UTC`,
        `FRONTEND_URL=https://$(PRIMARY_DOMAIN)`,
        `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
        `SERVER_ADMIN_ACCESS_TOKEN=${adminToken}`,
      ].join("\n"),
    },
  });

  return { services };
}
