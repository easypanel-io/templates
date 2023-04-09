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
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `NODE_ENV=production`,
        `DB_USER=mongo`,
        `DB_PASSWORD=${mongoPassword}`,
        `DB_HOST=${input.projectName}_${input.databaseServiceName}`,
        `DB_PORT=27017`,
        `JWT_KEY=${jwtKey}`,
        `URL_LENGTH=8`,
        `URL_SET=standard`,
        `URL_ONLY_UNIQUE=false`,
        `HOME_REDIRECT=/dash/overview`,
        `FORCE_FRONTEND_REDIRECT=false`,
        `ENABLE_REGISTRATION=false`,
        `DOMAIN=https://${input.domain}`,
        `DEMO=false`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 3000,
        secure: true,
      },
    },
  });

  services.push({
    type: "mongo",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      image: "mongo:4",
      password: mongoPassword,
    },
  });

  return { services };
}
