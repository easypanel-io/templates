import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `MATOMO_DATABASE_ADAPTER=mysql`,
        `MATOMO_DATABASE_HOST=${input.projectName}_${input.databaseServiceName}`,
        `MATOMO_DATABASE_TABLES_PREFIX=matomo_`,
        `MATOMO_DATABASE_USERNAME=mariadb`,
        `MATOMO_DATABASE_PASSWORD=${databasePassword}`,
        `MATOMO_DATABASE_DBNAME=${input.projectName}`,
      ].join("\n"),
      source: {
        type: "image",
        image: "matomo",
      },
      proxy: {
        port: 80,
        secure: true,
      },
      domains: [{ name: input.domain }],
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
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
