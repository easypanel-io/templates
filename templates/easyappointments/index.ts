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
  const secretKey = randomString(16);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `BASE_URL=https://$(PRIMARY_DOMAIN)`,
        `DEBUG_MODE=TRUE`,
        `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `DB_NAME=$(PROJECT_NAME)`,
        `DB_USERNAME=mysql`,
        `DB_PASSWORD=${databasePassword}`,
      ].join("\n"),
      source: { type: "image", image: input.appServiceImage },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
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
