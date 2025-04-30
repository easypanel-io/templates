import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "mysql",
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
          port: 80,
        },
      ],
      env: [
        `AUTH_USERNAME=${input.authUsername}`,
        `AUTH_PASSWORD=${input.authPassword}`,
        `DB_CONNECTION_TYPE=host`,
        `DB_DRIVER=mysql`,
        `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `DB_NAME=$(PROJECT_NAME)`,
        `DB_USER=mysql`,
        `DB_PASS=${databasePassword}`,
        `SESSION_TYPE=DB`,
        `USER_CONFIG_TYPE=DB`,
      ].join("\n"),
    },
  });

  return { services };
}
