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

  const appKey = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `DB_PORT=3306`,
        `DB_CONNECTION=mysql`,
        `DB_DATABASE=$(PROJECT_NAME)`,
        `DB_USERNAME=mysql`,
        `DB_PASSWORD=${databasePassword}`,
        `APP_KEY=${appKey}`,
        `APP_URL=https://$(PRIMARY_DOMAIN)`,
        `TRUSTED_PROXIES=**`,
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
