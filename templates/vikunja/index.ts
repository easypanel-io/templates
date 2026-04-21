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
  const jwtSecret = randomString(32);

  services.push({
    type: "mariadb",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `VIKUNJA_SERVICE_PUBLICURL=https://$(PRIMARY_DOMAIN)`,
        `VIKUNJA_DATABASE_HOST=$(PROJECT_NAME)-${input.appServiceName}-db`,
        `VIKUNJA_DATABASE_PASSWORD=${databasePassword}`,
        `VIKUNJA_DATABASE_TYPE=mysql`,
        `VIKUNJA_DATABASE_USER=mariadb`,
        `VIKUNJA_DATABASE_DATABASE=$(PROJECT_NAME)`,
        `VIKUNJA_SERVICE_JWTSECRET=${jwtSecret}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3456,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "files",
          mountPath: "/app/vikunja/files",
        },
      ],
    },
  });

  return { services };
}
