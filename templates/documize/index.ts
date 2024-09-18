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
      serviceName: input.appServiceName,
      env: [
        `DOCUMIZELOCATION=localhost`,
        `DOCUMIZEDBTYPE=postgresql`,
        `DOCUMIZESALT=${databaseSalt}`,
        `DOCUMIZEDB=host=$(PROJECT_NAME)_${input.databaseServiceName} port=5432 sslmode=disable user=postgres password=${databasePassword} dbname=$(PROJECT_NAME)`,
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
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      image: "postgres:12",
      password: databasePassword,
    },
  });

  return { services };
}
