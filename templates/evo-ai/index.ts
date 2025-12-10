import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const redisPassword = randomPassword();
  const jwtSecretKey = randomString(32);
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-api`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `POSTGRES_CONNECTION_STRING=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-postgres:5432/$(PROJECT_NAME)`,
        `REDIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
        `REDIS_PORT=6379`,
        `ADMIN_INITIAL_PASSWORD=${input.adminInitialPassword}`,
        `REDIS_PASSWORD=${redisPassword}`,
        `REDIS_SSL=false`,
        `REDIS_KEY_PREFIX=a2a:`,
        `REDIS_TTL=3600`,
        `JWT_SECRET_KEY=${jwtSecretKey}`,
        `SENDGRID_API_KEY=${input.sendgridApiKey || ""}`,
        `EMAIL_FROM=${input.emailFrom || "noreply@example.com"}`,
        `APP_URL=https://$(PRIMARY_DOMAIN)`,
        `LOG_LEVEL=INFO`,
        `DEBUG=false`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "logs",
          mountPath: "/app/logs",
        },
        {
          type: "volume",
          name: "static",
          mountPath: "/app/static",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-frontend`,
      source: {
        type: "image",
        image: input.frontendImage,
      },
      env: [
        `NEXT_PUBLIC_API_URL=https://$(PROJECT_NAME)-${input.appServiceName}-api.$(EASYPANEL_HOST)`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-postgres`,
      password: databasePassword,
    },
  });
  services.push({
    type: "redis",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      password: redisPassword,
    },
  });

  return { services };
}
