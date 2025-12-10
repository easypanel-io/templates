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
  const redisPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      mounts: [{ type: "volume", name: "app", mountPath: "/usr/src/app" }],
      env: [
        `SITE_NAME=${input.siteName || "$(PROJECT_NAME)"}`,
        `DEFAULT_DOMAIN=$(PRIMARY_DOMAIN)`,
        `CUSTOM_DOMAIN_USE_HTTPS=true`,
        `DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `DB_NAME=$(PROJECT_NAME)`,
        `DB_USER=postgres`,
        `DB_PASSWORD=${databasePassword}`,
        `REDIS_HOST=$(PROJECT_NAME)_${input.redisServiceName}`,
        `REDIS_PASSWORD=${redisPassword}`,
        `JWT_SECRET=${randomString(64)}`,
        `MAIL_HOST=${input.mailHost || ""}`,
        `MAIL_PORT=${input.mailPort || ""}`,
        `MAIL_SECURE=${input.mailSecure}`,
        `MAIL_USER=${input.mailUser || ""}`,
        `MAIL_FROM=${input.mailFrom || ""}`,
        `MAIL_PASSWORD=${input.mailPassword || ""}`,
        `ADMIN_EMAILS=${input.adminEmails || ""}`,
        `REPORT_EMAIL=${input.reportEmail || ""}`,
      ].join("\n"),
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  services.push({
    type: "redis",
    data: { serviceName: input.redisServiceName, password: redisPassword },
  });

  return { services };
}
