import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `MODE=PROD`,
        `BINDING=0.0.0.0`,
        `POSTGRES_DATABASE=$(PROJECT_NAME)`,
        `POSTGRES_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `POSTGRES_PASSWORD=${databasePassword}`,
        `POSTGRES_PORT=5432`,
        `POSTGRES_SSL=false`,
        `POSTGRES_SSL_REJECT_UNAUTHORIZED=false`,
        `POSTGRES_USER=postgres`,
        `POSTGRES_QUERY_TIMEOUT=100000`,
        `POSTGRES_STATEMENT_TIMEOUT=100000`,
        `DELETE_AFTER_DAYS=30`,
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
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/app/data",
        },
      ],
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
