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
  const jwtSecret = randomString(32);
  const appUrl = `https://$(PRIMARY_DOMAIN)`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      env: [
        `NODE_ENV=production`,
        `PORT=3000`,
        `DB_HOST=$(PROJECT_NAME)_${databaseServiceName}`,
        `DB_PORT=5432`,
        `DB_USER=postgres`,
        `DB_PASSWORD=${databasePassword}`,
        `DB_NAME=$(PROJECT_NAME)`,
        `JWT_SECRET=${jwtSecret}`,
        `APP_URL=${appUrl}`,
        `INSTANCE_URL=${appUrl}`,
        `FRONTEND_URL=${appUrl}`,
        `VITE_API_URL=${appUrl}/api`,
        `INSTANCE_NAME=${input.instanceName}`,
        `REGISTRATION_MODE=${input.registrationMode}`,
        `FINNHUB_API_KEY=${input.finnhubApiKey || ""}`,
        `ALPHA_VANTAGE_API_KEY=${input.alphaVantageApiKey || ""}`,
        `EMAIL_HOST=${input.emailHost || ""}`,
        `EMAIL_PORT=${input.emailPort || 587}`,
        `EMAIL_USER=${input.emailUser || ""}`,
        `EMAIL_PASS=${input.emailPassword || ""}`,
        `EMAIL_FROM=${input.emailFrom}`,
        `RUN_MIGRATIONS=true`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "logs",
          mountPath: "/app/backend/src/logs",
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/app/backend/src/data",
        },
        {
          type: "volume",
          name: "uploads",
          mountPath: "/app/backend/uploads",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
