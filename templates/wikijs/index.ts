import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const databaseUsername = input.databaseType;
  const databasePort = input.databaseType === "postgres" ? "5432" : "3306";

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `DB_TYPE=${input.databaseType}`,
        `DB_HOST=${input.projectName}_${input.databaseServiceName}`,
        `DB_PORT=${databasePort}`,
        `DB_USER=${databaseUsername}`,
        `DB_PASS=${databasePassword}`,
        `DB_NAME=${input.projectName}`,
      ].join("\n"),
      source: {
        type: "image",
        image: "ghcr.io/requarks/wiki:2",
      },
      proxy: {
        port: 3000,
        secure: true,
      },
      domains: [{ name: input.domain }],
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

  if (input.databaseType === "mysql") {
    services.push({
      type: "mysql",
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
