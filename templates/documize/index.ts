import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databaseSalt = randomString(64);
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `DOCUMIZELOCATION=localhost`,
        `DOCUMIZEDBTYPE=postgresql`,
        `DOCUMIZESALT=${databaseSalt}`,
        `DOCUMIZEDB=host=${input.projectName}_${input.databaseServiceName} port=5432 sslmode=disable user=postgres password=${databasePassword} dbname=${input.projectName}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 80,
        secure: true,
      },
    },
  });

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      image: "postgres:12",
      password: databasePassword,
    },
  });

  return { services };
}
