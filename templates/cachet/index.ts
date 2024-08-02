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

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `APP_KEY=base64:${btoa(randomString(32))}`,
        `DB_DRIVER=pgsql`,
        `DB_USERNAME=postgres`,
        `DB_PASSWORD=${databasePassword}`,
        `DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `DB_PORT=5432`,
        `DB_DATABASE=$(PROJECT_NAME)`,
        `APP_ENV=production`,
        `DOCKER=true`,
        `TRUSTED_PROXIES=*`,
        `DEBUGBAR_ENABLED=false`,
        `DEBUG=false`,
        `APP_DEBUG=false`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
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
