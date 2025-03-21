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
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();
  const envs = [
    `N8N_HOST=$(PRIMARY_DOMAIN)`,
    `WEBHOOK_URL=https://$(PRIMARY_DOMAIN)`,
    `N8N_PROTOCOL=https`,
    `GENERIC_TIMEZONE=UTC`,
    `N8N_ENCRYPTION_KEY=${encryptionKey}`,
    `N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true`,
    'N8N_RUNNERS_ENABLED=true'
  ];
  
  if (input.redisService) {
    services.push({
      type: "redis",
      data: {
        serviceName: input.appServiceName + '-redis',
        password: redisPassword
      },
    });

    envs.push('// Redis');
    envs.push(`QUEUE_BULL_REDIS_HOST=$(PROJECT_NAME)_${input.redisServiceName}`,);
    envs.push(`QUEUE_BULL_REDIS_USERNAME=default`,);
    envs.push(`QUEUE_BULL_REDIS_PASSWORD=${redisPassword}`,);
    envs.push(`QUEUE_BULL_PREFIX=n8n`,);
  }

  if (input.databaseType === 'postgres') {
    services.push({
      type: "postgres",
      data: {
        serviceName: input.appServiceName + '-db',
        password: databasePassword,
      },
    });

    envs.push('// Database');
    envs.push(`DB_TYPE=postgresdb`);
    envs.push(`DB_POSTGRESDB_DATABASE=$(PROJECT_NAME)`);
    envs.push(`DB_POSTGRESDB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`);
    envs.push(`DB_POSTGRESDB_PORT=5432`);
    envs.push(`DB_POSTGRESDB_USER=postgres`);
    envs.push(`DB_POSTGRESDB_PASSWORD=${databasePassword}`);
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: envs.join("\n"),
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

  return { services };
}