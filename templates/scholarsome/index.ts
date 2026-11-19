import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const dbPassword = randomPassword();
  const jwtSecret = randomString(40);

  const mariadbHostname = `$(PROJECT_NAME)_${input.appServiceName}-mariadb`;
  const redisHostname = `$(PROJECT_NAME)-${input.appServiceName}-redis`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `NODE_ENV=production`,
        `DATABASE_URL=mysql://scholarsome:${dbPassword}@${mariadbHostname}:3306/scholarsome`,
        `JWT_SECRET=${jwtSecret}`,
        `HTTP_PORT=3000`,
        `HOST=https://$(EASYPANEL_DOMAIN)`,
        `STORAGE_TYPE=local`,
        `STORAGE_LOCAL_DIR=/data`,
        `REDIS_HOST=${redisHostname}`,
        `REDIS_PORT=6379`,
        `REDIS_USERNAME=`,
        `REDIS_PASSWORD=${dbPassword}`,
        `SMTP_HOST=${input.smtpHost || ""}`,
        `SMTP_PORT=${input.smtpPort || "587"}`,
        `SMTP_USERNAME=${input.smtpUsername || ""}`,
        `SMTP_PASSWORD=${input.smtpPassword || ""}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-mariadb`,
      source: {
        type: "image",
        image: "mariadb:11",
      },
      env: [
        `MARIADB_RANDOM_ROOT_PASSWORD=yes`,
        `MARIADB_ROOT_HOST=localhost`,
        `MARIADB_DATABASE=scholarsome`,
        `MARIADB_USER=scholarsome`,
        `MARIADB_PASSWORD=${dbPassword}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "mariadb-data",
          mountPath: "/var/lib/mysql",
        },
      ],
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      password: dbPassword,
    },
  });

  return { services };
}
