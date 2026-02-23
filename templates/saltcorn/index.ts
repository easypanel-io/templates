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
  const sessionSecretKey = randomString(32);

  const common_env = [
    `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
    `PGUSER=postgres`,
    `PGHOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
    `PGPORT=5432`,
    `PGPASSWORD=${databasePassword}`,
    `PGDATABASE=$(PROJECT_NAME)`,
    `SALTCORN_SESSION_SECRET=${sessionSecretKey}`,
  ].join("\n");

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [common_env].join("\n"),
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
      deploy: {
        command: "/usr/local/bin/saltcorn serve",
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-migrations`,
      env: [common_env].join("\n"),
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
      deploy: {
        command: "/usr/local/bin/saltcorn reset-schema --force",
      },
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  return { services };
}
