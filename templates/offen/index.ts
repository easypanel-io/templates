import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const databasePassword = randomPassword();

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-postgres`,
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
          port: 80,
        },
      ],
      env: [
        `OFFEN_DATABASE_DIALECT=postgres`,
        `OFFEN_DATABASE_CONNECTIONSTRING=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-postgres:5432/$(PROJECT_NAME)?sslmode=disable`,
        `OFFEN_DATABASE_CONNECTIONRETRIES=10`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "certs",
          mountPath: "/var/www/.cache",
        },
      ],
    },
  });

  return { services };
}
