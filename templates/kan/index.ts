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
  const authSecret = randomString(32);
  const postgresUrl = `postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`;

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-migrate`,
      source: {
        type: "image",
        image: input.migrateServiceImage,
      },
      env: [`POSTGRES_URL=${postgresUrl}`].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
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
      env: [
        `NEXT_PUBLIC_BASE_URL=https://$(PRIMARY_DOMAIN)`,
        `BETTER_AUTH_SECRET=${authSecret}`,
        `POSTGRES_URL=${postgresUrl}`,
        `NEXT_PUBLIC_ALLOW_CREDENTIALS=true`,
      ].join("\n"),
    },
  });

  return { services };
}
