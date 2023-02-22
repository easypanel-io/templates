import {
  Output,
  randomPassword,
  randomString,
  Services
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const apikey = randomString(32);
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `POSTGRESQL_USER=postgres`,
        `POSTGRESQL_PORT=5432`,
        `POSTGRESQL_HOST=${input.projectName}_${input.databaseServiceName}`,
        `POSTGRESQL_DATABASE_NAME=${input.databaseServiceName}`,
        `POSTGRESQL_PASSWORD=${databasePassword}`,
        `API_KEYS=${apikey}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 3567,
        secure: true,
      },
    },
  });

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
