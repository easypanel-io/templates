import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mysqlPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `FR_DB_HOST=${input.projectName}_${input.databaseServiceName}`,
        `FR_DB_PORT=3306`,
        `FR_DB_USER=${input.databaseType}`,
        `FR_DB_PASS=${mysqlPassword}`,
        `FR_DB_NAME=${input.projectName}`,
        `APACHE_RUN_USER=www-data`,
        `APACHE_RUN_USER_ID=33`,
        `APACHE_RUN_GROUP=www-data`,
        `APACHE_RUN_GROUP_ID=33`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 80,
        secure: true,
      },
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
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: mysqlPassword,
    },
  });

  return { services };
}
