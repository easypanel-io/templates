import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mysqlPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `FR_DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `FR_DB_PORT=3306`,
        `FR_DB_USER=mysql`,
        `FR_DB_PASS=${mysqlPassword}`,
        `FR_DB_NAME=$(PROJECT_NAME)`,
        `APACHE_RUN_USER=www-data`,
        `APACHE_RUN_USER_ID=33`,
        `APACHE_RUN_GROUP=www-data`,
        `APACHE_RUN_GROUP_ID=33`,
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
        {
          type: "volume",
          name: "files",
          mountPath: "/user-files",
        },
      ],
    },
  });

  services.push({
    type: "mysql",
    data: { serviceName: input.databaseServiceName, password: mysqlPassword },
  });

  return { services };
}
