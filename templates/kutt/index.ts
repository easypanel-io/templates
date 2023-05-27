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
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      proxy: { port: 3000, secure: true },
      domains: [{ name: input.domain }],
      mounts: [{ type: "volume", name: "app", mountPath: "/usr/src/app" }],
      env: [
        `SITE_NAME=${input.siteName || input.projectName}`,
        `DEFAULT_DOMAIN=${input.domain}`,
        `CUSTOM_DOMAIN_USE_HTTPS=true`,
        `DB_HOST=${input.projectName}_${input.databaseServiceName}`,
        `DB_NAME=${input.projectName}`,
        `DB_USER=postgres`,
        `DB_PASSWORD=${databasePassword}`,
        `REDIS_HOST=${input.projectName}_${input.redisServiceName}`,
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
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  services.push({
    type: "redis",
    data: {
      projectName: input.projectName,
      serviceName: input.redisServiceName,
      password: redisPassword,
    },
  });

  return { services };
}
