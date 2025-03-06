import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const encryptionKey = randomString(32);
  const redisPassword = randomPassword();
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `N8N_HOST=https://$(PRIMARY_DOMAIN)`,
        `WEBHOOK_URL=https://$(EASYPANEL_DOMAIN)`,
        `N8N_PROTOCOL=https`,
        `GENERIC_TIMEZONE=UTC`,
        `N8N_ENCRYPTION_KEY=${encryptionKey}`,
        // Database
        `DB_TYPE=postgresdb`,
        `DB_POSTGRESDB_DATABASE=$(PROJECT_NAME)`,
        `DB_POSTGRESDB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `DB_POSTGRESDB_PORT=5432`,
        `DB_POSTGRESDB_USER=postgres`,
        `DB_POSTGRESDB_PASSWORD=${databasePassword}`,
        // Redis
        `QUEUE_BULL_REDIS_HOST=$(PROJECT_NAME)_${input.redisServiceName}`,
        `QUEUE_BULL_REDIS_USERNAME=default`,
        `QUEUE_BULL_REDIS_PASSWORD=${redisPassword}`,
        `QUEUE_BULL_PREFIX=n8n`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [{
        host: "$(EASYPANEL_DOMAIN)",
        port: 5678,
      }, ],
      mounts: [{
        type: "volume",
        name: "data",
        mountPath: "/home/node/.n8n",
      }, ],
    },
  });

  services.push({
    type: "redis",
    data: { serviceName: input.redisServiceName, password: redisPassword },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}