import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-db`,
      source: {
        type: "image",
        image: "bitnami/mariadb:latest",
      },
      env: [
        "ALLOW_EMPTY_PASSWORD=yes",
        `MARIADB_USER=mariadb`,
        `MARIADB_PASSWORD=${databasePassword}`,
        `MARIADB_DATABASE=$(PROJECT_NAME)`,
        "MARIADB_CHARACTER_SET=utf8mb4",
        "MARIADB_COLLATE=utf8mb4_unicode_ci",
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "mariadb-data",
          mountPath: "/bitnami/mariadb",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `MOODLE_DATABASE_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `MOODLE_DATABASE_PORT_NUMBER=3306`,
        `MOODLE_DATABASE_USER=mariadb`,
        `MOODLE_DATABASE_NAME=$(PROJECT_NAME)`,
        `MOODLE_DATABASE_PASSWORD=${databasePassword}`,
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
      mounts: [
        {
          type: "volume",
          name: "moodle-data",
          mountPath: "/bitnami/moodle",
        },
      ],
    },
  });

  return { services };
}
