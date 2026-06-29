import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const dbPassword = randomPassword();

  // Web application — official Discourse image, listens on port 80
  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `DISCOURSE_HOSTNAME=$(PRIMARY_DOMAIN)`,
        `DISCOURSE_DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `DISCOURSE_DB_PASSWORD=${dbPassword}`,
        `DISCOURSE_REDIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
        `DISCOURSE_DEVELOPER_EMAILS=${input.discourseEmail}`,
        `DISCOURSE_SMTP_ADDRESS=${input.smtpAddress}`,
        `DISCOURSE_SMTP_PORT=${input.smtpPort}`,
        `DISCOURSE_SMTP_USER_NAME=${input.smtpUsername}`,
        `DISCOURSE_SMTP_PASSWORD=${input.smtpPassword}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "web-data",
          mountPath: "/shared",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
    },
  });

  // Discourse-flavoured Postgres — uses DB_PASSWORD, not the standard POSTGRES_PASSWORD
  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-db`,
      source: {
        type: "image",
        image: input.dbServiceImage,
      },
      env: [`DB_PASSWORD=${dbPassword}`].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "db-data",
          mountPath: "/var/lib/postgresql",
        },
      ],
    },
  });

  // Redis — no auth required by the official Discourse image
  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      source: {
        type: "image",
        image: "redis:7-alpine",
      },
      deploy: {
        command: "redis-server --save 60 1",
      },
      mounts: [
        {
          type: "volume",
          name: "redis-data",
          mountPath: "/data",
        },
      ],
    },
  });

  return { services };
}
