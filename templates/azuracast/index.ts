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
        `LANG=en_US`,
        `APPLICATION_ENV=production`,
        `MYSQL_HOST=$(PROJECT_NAME)-${input.appServiceName}-db`,
        `MYSQL_PORT=3306`,
        `MYSQL_USER=mariadb`,
        `MYSQL_PASSWORD=${databasePassword}`,
        `MYSQL_DATABASE=$(PROJECT_NAME)`,
        `MYSQL_RANDOM_ROOT_PASSWORD=yes`,
        `ENABLE_REDIS=true`,
        `AZURACAST_PUID=1000`,
        `AZURACAST_PGID=1000`,
        `AUTO_ASSIGN_PORT_MIN=8000`,
        `AUTO_ASSIGN_PORT_MAX=8499`,
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
      ports: [
        {
          published: Number(input.appServicePort),
          target: 2022,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "station_data",
          mountPath: "/var/azuracast/stations",
        },
        {
          type: "volume",
          name: "uploads",
          mountPath: "/var/azuracast/uploads",
        },
        {
          type: "volume",
          name: "backups",
          mountPath: "/var/azuracast/backups",
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
