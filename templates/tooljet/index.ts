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
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 80 }],
      deploy: {
        command: "sleep 60; npm run db:setup:prod; npm run start:prod",
      },
      env: [
        `TOOLJET_HOST=https://$(PRIMARY_DOMAIN)`,
        `SERVER_HOST=$(PRIMARY_DOMAIN)`,
        `LOCKBOX_MASTER_KEY=${randomString(32)}`,
        `SECRET_KEY_BASE=${randomString(64)}`,
        `ORM_LOGGING=all`,
        `PG_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `PG_DB=$(PROJECT_NAME)`,
        `PG_USER=postgres`,
        `PG_PASS=${databasePassword}`,
        `CHECK_FOR_UPDATES=true`,
        `ENABLE_MULTIPLAYER_EDITING=true`,
        `USER_SESSION_EXPIRY=2880`,
        `DEPLOYMENT_PLATFORM=docker`,
        `SERVE_CLIENT=true`,
        `PORT=80`,
      ].join("\n"),
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
