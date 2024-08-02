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
        `MATOMO_DATABASE_ADAPTER=mysql`,
        `MATOMO_DATABASE_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `MATOMO_DATABASE_TABLES_PREFIX=matomo_`,
        `MATOMO_DATABASE_USERNAME=mariadb`,
        `MATOMO_DATABASE_PASSWORD=${databasePassword}`,
        `MATOMO_DATABASE_DBNAME=$(PROJECT_NAME)`,
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
      mounts: [
        {
          type: "volume",
          name: "html",
          mountPath: "/var/www/html",
        },
      ],
    },
  });

  services.push({
    type: "mariadb",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
