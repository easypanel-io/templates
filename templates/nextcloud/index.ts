import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const appEnv = [];

  if (input.databaseType === "mariadb") {
    appEnv.push(
      `MYSQL_DATABASE=$(PROJECT_NAME)`,
      `MYSQL_USER=mariadb`,
      `MYSQL_PASSWORD=${databasePassword}`,
      `MYSQL_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`
    );

    services.push({
      type: "mariadb",
      data: {
        serviceName: input.databaseServiceName,
        password: databasePassword,
      },
    });
  }

  if (input.databaseType === "postgres") {
    appEnv.push(
      `POSTGRES_DB=$(PROJECT_NAME)`,
      `POSTGRES_USER=postgres`,
      `POSTGRES_PASSWORD=${databasePassword}`,
      `POSTGRES_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`
    );

    services.push({
      type: "postgres",
      data: {
        serviceName: input.databaseServiceName,
        password: databasePassword,
      },
    });
  }

  if (input.databaseType === "sqlite") {
    appEnv.push(`SQLITE_DATABASE=$(PROJECT_NAME)`);
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: appEnv.join("\n"),
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
          name: "data",
          mountPath: "/var/www/html",
        },
      ],
    },
  });

  return { services };
}
