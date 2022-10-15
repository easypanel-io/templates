import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const appEnv = [];

  if (input.databaseType === "mariadb") {
    appEnv.push(
      `MYSQL_DATABASE=${input.projectName}`,
      `MYSQL_USER=mariadb`,
      `MYSQL_PASSWORD=${databasePassword}`,
      `MYSQL_HOST=${input.projectName}_${input.databaseServiceName}`
    );

    services.push({
      type: "mariadb",
      data: {
        projectName: input.projectName,
        serviceName: input.databaseServiceName,
        password: databasePassword,
      },
    });
  }

  if (input.databaseType === "postgres") {
    appEnv.push(
      `POSTGRES_DB=${input.projectName}`,
      `POSTGRES_USER=postgres`,
      `POSTGRES_PASSWORD=${databasePassword}`,
      `POSTGRES_HOST=${input.projectName}_${input.databaseServiceName}`
    );

    services.push({
      type: "postgres",
      data: {
        projectName: input.projectName,
        serviceName: input.databaseServiceName,
        password: databasePassword,
      },
    });
  }

  if (input.databaseType === "sqlite") {
    appEnv.push(`SQLITE_DATABASE=${input.projectName}`);
  }

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: appEnv.join("\n"),
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
          name: "data",
          mountPath: "/var/www/html",
        },
      ],
    },
  });

  return { services };
}
