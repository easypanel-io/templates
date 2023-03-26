import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();

  const appEnv = [
    `LOCAL_DOMAIN=${
      input.mastodonDomain || input.projectName + "_" + input.appServiceName
    }`,
    `DB_HOST=${input.projectName}_${input.databaseServiceName}`,
    `DB_NAME=${input.projectName}`,
    `DB_USER=postgres`,
    `DB_PASS=${databasePassword}`,
    `REDIS_HOST=${input.projectName}_${input.redisServiceName}`,
    `REDIS_PASSWORD=${redisPassword}`,
    `SMTP_SERVER=${input.smtpServer || "mail.example.com"}`,
    `SMTP_PORT=${input.smtpPort || 25}`,
    `SMTP_LOGIN=${input.smtpLogin || ""}`,
    `SMTP_PASSWORD=${input.smtpPassword || ""}`,
    `SMTP_FROM_ADDRESS=${input.smtpFromAddress || "notifications@example.com"}`,
    `ES_ENABLED=false`,
    `S3_ENABLED=false`,
    `WEB_DOMAIN=${
      input.domain || input.projectName + "_" + input.appServiceName
    }`,
    `MASTODON_HTTPS_ENABLED=true`,
    `MASTODON_ADMIN_USERNAME=${input.adminUsername || "user"}`,
    `MASTODON_ADMIN_PASSWORD=${input.adminPassword || randomPassword()}`,
    `MASTODON_ADMIN_EMAIL=${input.adminEmail || "user@joinmastodon.org"}`,
  ];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: input.domain ? [{ name: input.domain }] : [],
      proxy: { port: 80, secure: true },
      env: appEnv.join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/bitnami/mastodon",
        },
      ],
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
