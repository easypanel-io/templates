import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mongoPassword = randomPassword();
  const jwtKey = randomString(64);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `NODE_ENV=production`,
        `DB_USER=mongo`,
        `DB_PASSWORD=${mongoPassword}`,
        `DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `DB_PORT=27017`,
        `JWT_KEY=${jwtKey}`,
        `URL_LENGTH=8`,
        `URL_SET=standard`,
        `URL_ONLY_UNIQUE=false`,
        `HOME_REDIRECT=/dash/overview`,
        `FORCE_FRONTEND_REDIRECT=false`,
        `ENABLE_REGISTRATION=false`,
        `DOMAIN=https://$(PRIMARY_DOMAIN)`,
        `DEMO=false`,
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
    type: "mongo",
    data: {
      serviceName: input.databaseServiceName,
      image: "mongo:4",
      password: mongoPassword,
    },
  });

  return { services };
}
