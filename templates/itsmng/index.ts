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
        `MARIADB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `MARIADB_USER=mariadb`,
        `MARIADB_PASSWORD=${databasePassword}`,
        `MARIADB_DATABASE=$(PROJECT_NAME)`,
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
          name: "config",
          mountPath: "/var/www/itsm-ng/config",
        },
        {
          type: "volume",
          name: "plugins",
          mountPath: "/var/www/itsm-ng/plugins",
        },
        {
          type: "volume",
          name: "files",
          mountPath: "/var/www/itsm-ng/files",
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
