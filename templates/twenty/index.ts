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
  const accessTokenSecret = randomString(32);
  const loginTokenSceret = randomString(32);
  const refreshTokenSecret = randomString(32);
  const fileTokenSecret = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `PG_DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`,
        `ACCESS_TOKEN_SECRET=${accessTokenSecret}`,
        `LOGIN_TOKEN_SECRET=${loginTokenSceret}`,
        `REFRESH_TOKEN_SECRET=${refreshTokenSecret}`,
        `FILE_TOKEN_SECRET=${fileTokenSecret}`,
        `SERVER_URL=https://$(EASYPANEL_DOMAIN)`,
        "FRONT_BASE_URL=http://localhost:3001",
        `SIGN_IN_PREFILLED=true`,
        `STORAGE_TYPE=local`,
        `ENABLE_DB_MIGRATIONS=true`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      image: "twentycrm/twenty-postgres:v0.10",
      password: databasePassword,
    },
  });

  return { services };
}
