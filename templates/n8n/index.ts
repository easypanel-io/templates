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
  
  const databaseServiceName = input.appServiceName + '-db';
  const databasePassword = randomPassword();
  
  const redisServiceName = input.appServiceName + '-redis';
  const redisPassword = randomPassword();

  const envs = [
    `# Base URL`,
    `N8N_HOST=$(PRIMARY_DOMAIN)`,
    `N8N_PROTOCOL=https`,
    `WEBHOOK_URL=https://$(PRIMARY_DOMAIN)/`,
    `N8N_EDITOR_BASE_URL=https://$(PRIMARY_DOMAIN)`,

    `# Proxy`,
    `N8N_PROXY_HOPS=1`,

    `# Timezone and Language`,
    `GENERIC_TIMEZONE=${input.appTimezone}`,
    `N8N_DEFAULT_LOCALE=${input.appLanguage}`,

    `# Security`,
    `N8N_ENCRYPTION_KEY=${encryptionKey}`,
    `N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true`,
    `# N8N_BLOCK_ENV_ACCESS_IN_NODE=true`,
    `# N8N_BLOCK_FILE_ACCESS_TO_N8N_FILES=true`,
    `# N8N_PUBLIC_API_DISABLED=true`,

    `# Settings`,
    `N8N_RUNNERS_ENABLED=true`,
    `EXECUTIONS_DATA_PRUNE=true`,
    `EXECUTIONS_DATA_MAX_AGE=336`,
    `EXECUTIONS_DATA_PRUNE_MAX_COUNT=10000`,
    `EXECUTIONS_DATA_SAVE_ON_SUCCESS=none`,
    `EXECUTIONS_DATA_SAVE_ON_ERROR=all`,
    `EXECUTIONS_TIMEOUT=1800`,
    `EXECUTIONS_TIMEOUT_MAX=3600`,
    `N8N_AI_TIMEOUT_MAX=3600000`,
    `N8N_CONCURRENCY_PRODUCTION_LIMIT=20`,

    `# Payload Limits`,
    `N8N_PAYLOAD_SIZE_MAX=16`,
    `N8N_FORMDATA_FILE_SIZE_MAX=200`,

    `# Logs`,
    `N8N_LOG_FORMAT=json`,
    `N8N_LOG_LEVEL=info`,
  ];

  // Postgres
  if (input.databaseType === 'postgres') {
    services.push({
      type: "postgres",
      data: {
        serviceName: databaseServiceName,
        password: databasePassword,
      },
    });

    const postgres_envs = [
      `# Database`,
      `DB_TYPE=postgresdb`,
      `DB_POSTGRESDB_HOST=$(PROJECT_NAME)_${databaseServiceName}`,
      `DB_POSTGRESDB_PORT=5432`,
      `DB_POSTGRESDB_DATABASE=$(PROJECT_NAME)`,
      `DB_POSTGRESDB_USER=postgres`,
      `DB_POSTGRESDB_PASSWORD=${databasePassword}`,
      `DB_POSTGRESDB_POOL_SIZE=10`,
    ];

    envs.push(...postgres_envs);
  }
  
  // Redis
  if (input.redisService) {
    services.push({
      type: "redis",
      data: {
        serviceName: redisServiceName,
        password: redisPassword
      },
    });

    const redis_envs = [
      `# Redis`,
      `QUEUE_BULL_REDIS_HOST=$(PROJECT_NAME)_${redisServiceName}`
      `QUEUE_BULL_REDIS_PORT=6379`
      `QUEUE_BULL_REDIS_USERNAME=default`
      `QUEUE_BULL_REDIS_PASSWORD=${redisPassword}`
      `QUEUE_BULL_PREFIX=n8n`
      `OFFLOAD_MANUAL_EXECUTIONS_TO_WORKERS=true`
    ];

    envs.push(...redis_envs);
  }

  // Worker
  if (
    input.workerInstance
    && input.databaseType === 'postgres'
    && input.redisService
  ) {
    envs.push('# Queue Worker');
    envs.push('EXECUTIONS_MODE=queue');

    const worker_envs = [
      `# Queue Worker`,
      `EXECUTIONS_MODE=queue`,
      `# Security`,
      `N8N_ENCRYPTION_KEY=${encryptionKey}`,
      `# Timezone`,
      `GENERIC_TIMEZONE=${input.appTimezone}`,
      `# Logs`,
      `N8N_LOG_LEVEL=info`,
      `N8N_LOG_FORMAT=json`,
    ];

    worker_envs.push(...postgres_envs);
    worker_envs.push(...redis_envs);

    const worker_name = input.appServiceName + '-worker';

    services.push({
      type: "app",
      data: {
        serviceName: worker_name,
        env: worker_envs.join("\n"),
        source: {
          type: "image",
          image: input.appServiceImage,
        },
      },
    });
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