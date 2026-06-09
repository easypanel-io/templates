import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const appKey = input.appKey?.trim() || randomString(64);
  const dbServiceName = `${input.appServiceName}-db`;
  const gotenbergServiceName = `${input.appServiceName}-gotenberg`;

  const dbHost = `$(PROJECT_NAME)_${dbServiceName}`;
  const gotenbergHost = `$(PROJECT_NAME)_${gotenbergServiceName}`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `APP_KEY=${appKey}`,
        "DB_CONNECTION=pg",
        `GOTENBERG_URL=http://${gotenbergHost}:3000`,
        `PG_HOST=${dbHost}`,
        "PG_PORT=5432",
        "PG_USER=postgres",
        `PG_PASSWORD=${databasePassword}`,
        "PG_DB_NAME=$(PROJECT_NAME)",
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: gotenbergServiceName,
      source: {
        type: "image",
        image: input.gotenbergServiceImage,
      },
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: dbServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
