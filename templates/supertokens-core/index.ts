import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const apikey = randomString(32);
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `POSTGRESQL_USER=postgres`,
        `POSTGRESQL_PORT=5432`,
        `POSTGRESQL_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `POSTGRESQL_DATABASE_NAME=$(PROJECT_NAME)`,
        `POSTGRESQL_PASSWORD=${databasePassword}`,
        `API_KEYS=${apikey}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3567,
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
