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
        `TZ=Europe/Berlin`,
        `DEFAULT_DOMAIN=$(PRIMARY_DOMAIN)`,
        `IS_HTTPS_ENABLED=false`,
        `GEOLITE_LICENSE_KEY=${input.geolite2ApiKey}`,
        `DB_DRIVER=maria`,
        `DB_USER=mariadb`,
        `DB_NAME=$(PROJECT_NAME)`,
        `DB_PASSWORD=${databasePassword}`,
        `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
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
    type: "mariadb",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  return { services };
}
