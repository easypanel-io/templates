import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const databaseClient =
    input.databaseType === "mariadb" ? "mysql" : input.databaseType;
  const databaseUsername =
    input.databaseType === "postgres" ? "postgres" : "mariadb";
  const databasePort = input.databaseType === "postgres" ? "5432" : "3306";

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `DATABASE_CLIENT=${databaseClient}`,
        `DATABASE_HOST=${input.projectName}_${input.databaseServiceName}`,
        `DATABASE_PORT=${databasePort}`,
        `DATABASE_NAME=${input.projectName}`,
        `DATABASE_USERNAME=${databaseUsername}`,
        `DATABASE_PASSWORD=${databasePassword}`,
        `DATABASE_SSL=false`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 1337,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "app",
          mountPath: "/srv/app",
        },
      ],
    },
  });

  if (input.databaseType === "postgres") {
    services.push({
      type: "postgres",
      data: {
        projectName: input.projectName,
        serviceName: input.databaseServiceName,
        password: databasePassword,
      },
    });
  }

  if (input.databaseType === "mariadb") {
    services.push({
      type: "mariadb",
      data: {
        projectName: input.projectName,
        serviceName: input.databaseServiceName,
        password: databasePassword,
      },
    });
  }

  return { services };
}
