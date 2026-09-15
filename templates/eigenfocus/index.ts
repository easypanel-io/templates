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
  const authPassword = randomString(20);
  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `DEFAULT_HOST_URL=https://$(PRIMARY_DOMAIN)`,
        `FORCE_SSL=true`,
        `ASSUME_SSL_REVERSE_PROXY=true`,
        `POSTGRES_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `POSTGRES_PORT=5432`,
        `POSTGRES_DB_USER=postgres`,
        `POSTGRES_DB_PASSWORD=${databasePassword}`,
        `POSTGRES_DB_NAME=$(PROJECT_NAME)`,
        `HTTP_AUTH_USER=admin`,
        `HTTP_AUTH_PASSWORD=${authPassword}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "app-data",
          mountPath: "/eigenfocus-app/app-data",
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
