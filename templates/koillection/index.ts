import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const dbServiceName = `${input.appServiceName}-db`;
  const dbPassword = randomPassword();
  const appSecret = randomString(32);
  const jwtPassphrase = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `APP_ENV=prod`,
        `APP_DEBUG=0`,
        `APP_SECRET=${appSecret}`,
        `JWT_PASSPHRASE=${jwtPassphrase}`,
        `HTTPS_ENABLED=1`,
        `PHP_TZ=${input.timezone || "Etc/UTC"}`,
        `DB_DRIVER=pdo_pgsql`,
        `DB_HOST=$(PROJECT_NAME)_${dbServiceName}`,
        `DB_PORT=5432`,
        `DB_NAME=koillection`,
        `DB_USER=postgres`,
        `DB_PASSWORD=${dbPassword}`,
        `DB_VERSION=16`,
        `UPLOAD_MAX_FILESIZE=20M`,
        `PHP_MEMORY_LIMIT=512M`,
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
          name: "uploads",
          mountPath: "/uploads",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: dbServiceName,
      databaseName: "koillection",
      password: dbPassword,
    },
  });

  return { services };
}
