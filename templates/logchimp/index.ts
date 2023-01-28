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
  const appKey = randomString();

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: { port: 80, secure: true },
      env: [
        `ZABBIX_HOSTNAME=LogChimp`,
        `TIMEZONE=America/Vancouver`,
        `DEBUG_MODE=FALSE`,
        `CONTAINER_LOG_LEVEL=INFO`,
        `APP_KEY=${databasePassword}`,
        `FRONTEND_PORT=8080`,
        `BACKEND_HOSTNAME=localhost`,
        `BACKEND_PROTOCOL=http`,
        `BACKEND_PORT=3000`,
        `DB_HOST=${input.projectName}_${input.databaseServiceName}`,
        `DB_PORT=5432`,
        `DB_USER=postgres`,
        `DB_PASS=${databasePassword}`,
        `DB_NAME=${input.projectName}`,
      ].join("\n"),
    },
  });

  return { services };
}
