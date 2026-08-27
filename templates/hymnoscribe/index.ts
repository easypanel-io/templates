import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databaseServiceName = `${input.appServiceName}-db`;
  const databasePassword = randomPassword();
  const databaseRootPassword = randomPassword();
  const superPassword = randomPassword();
  const jwtSecret = randomString(64);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `NODE_ENV=production`,
        `DB_HOST=$(PROJECT_NAME)_${databaseServiceName}`,
        `DB_USER=hymnoscribe`,
        `DB_PASSWORD=${databasePassword}`,
        `DB_NAME=hymnoscribe`,
        `MYSQL_ROOT_PASSWORD=${databaseRootPassword}`,
        `URL=https://$(PRIMARY_DOMAIN)`,
        `FRONTEND_URL=https://$(PRIMARY_DOMAIN)`,
        `SUPER_PASSWORD=${superPassword}`,
        `JWT_SECRET=${jwtSecret}`,
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
      mounts: [
        {
          type: "volume",
          name: "uploads",
          mountPath: "/app/backend/uploads",
        },
      ],
    },
  });

  services.push({
    type: "mysql",
    data: {
      serviceName: databaseServiceName,
      databaseName: "hymnoscribe",
      user: "hymnoscribe",
      password: databasePassword,
      rootPassword: databaseRootPassword,
    },
  });

  return { services };
}
