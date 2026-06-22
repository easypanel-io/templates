import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const rootPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `DB_SERVER=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `DB_DATABASE=$(PROJECT_NAME)`,
        `DB_USER=mariadb`,
        `DB_PASSWORD=${databasePassword}`,
        `DB_PORT=3306`,
        `DEFAULT_SECURITY_LEVEL=low`,
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
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
      rootPassword: rootPassword,
    },
  });

  return { services };
}
