import {
  Output,
  randomPassword,
  randomString,
  Services
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `APP_KEY=base64:${btoa(randomString(32))}`,
        `DB_DRIVER=pgsql`,
        `DB_USERNAME=postgres`,
        `DB_PASSWORD=${databasePassword}`,
        `DB_HOST=${input.projectName}_${input.databaseServiceName}`,
        `DB_PORT=5432`,
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
      proxy: {
        port: 8000,
        secure: true,
      },
    },
  });

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
