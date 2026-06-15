import {
  Output,
  Services,
  randomPassword,
  randomString,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const dbServiceName = `${input.appServiceName}-db`;
  const appKey = `base64:${Buffer.from(randomString(32)).toString("base64")}`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `APP_ENV=production`,
        `APP_DEBUG=false`,
        `APP_URL=https://$(PRIMARY_DOMAIN)`,
        `APP_KEY=${appKey}`,
        `DB_CONNECTION=mysql`,
        `DB_HOST=$(PROJECT_NAME)_${dbServiceName}`,
        `DB_PORT=3306`,
        `DB_DATABASE=$(PROJECT_NAME)`,
        `DB_USERNAME=mariadb`,
        `DB_PASSWORD=${databasePassword}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
        {
          type: "volume",
          name: "conf",
          mountPath: "/conf",
        },
      ],
    },
  });

  services.push({
    type: "mariadb",
    data: {
      serviceName: `${input.appServiceName}-db`,
      image: input.dbServiceImage,
      password: databasePassword,
    },
  });

  return { services };
}
