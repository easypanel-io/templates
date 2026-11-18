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
  const secret = randomString(64);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `TR_DB_TYPE=mysql`,
        `TR_DB_USER=mysql`,
        `TR_DB_PASSWORD=${databasePassword}`,
        `TR_DB_DATABASE=$(PROJECT_NAME)`,
        `TR_DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `TR_DB_PORT=3306`,
        `NODE_ENV=production`,
        `TR_SECRET=${secret}`,
        `TR_VIRTUAL_HOST=https://$(PRIMARY_DOMAIN)`,
        `TR_THROTTLE_TTL=60000`,
        `TR_THROTTLE_LIMIT=600`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
    },
  });

  services.push({
    type: "mysql",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  return { services };
}
