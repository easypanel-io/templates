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
        `DB_SERVER=$(PROJECT_NAME)_${input.appServiceName}-mysql`,
        `DB_NAME=$(PROJECT_NAME)`,
        `DB_USER=root`,
        `DB_PASSWD=${databasePassword}`,
        `PS_DOMAIN=$(PRIMARY_DOMAIN)`,
        `PS_FOLDER_ADMIN=admin4577`,
        `PS_FOLDER_INSTALL=install4577`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/install4577",
          port: 80,
        },
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/admin4577",
          port: 80,
        },
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/",
          port: 80,
        },
      ],
    },
  });

  services.push({
    type: "mysql",
    data: {
      serviceName: `${input.appServiceName}-mysql`,
      rootPassword: databasePassword,
    },
  });

  return { services };
}
