import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const postgresPassword = randomPassword();
  const redisPassword = randomPassword();
  const rabbitmqPassword = randomPassword();
  const bullAuthKey = randomString(32);
  const testApiKey = randomString(32);

  services.push({
    type: "redis",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      password: redisPassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-rabbitmq`,
      source: {
        type: "image",
        image: "rabbitmq:3-management",
      },
      env: [
        `RABBITMQ_DEFAULT_USER=firecrawl`,
        `RABBITMQ_DEFAULT_PASS=${rabbitmqPassword}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "rabbitmq-data",
          mountPath: "/var/lib/rabbitmq",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-postgres`,
      source: {
        type: "image",
        image: input.postgresImage || "ghcr.io/firecrawl/nuq-postgres:latest",
      },
      env: [
        `POSTGRES_USER=postgres`,
        `POSTGRES_PASSWORD=${postgresPassword}`,
        `POSTGRES_DB=postgres`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "postgres-data",
          mountPath: "/var/lib/postgresql/data",
        },
      ],
    },
  });

  const playwrightEnv = [
    `PORT=3000`,
    `MAX_CONCURRENT_PAGES=${input.crawlConcurrentRequests || 10}`,
  ];

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-playwright`,
      source: {
        type: "image",
        image: input.playwrightServiceImage,
      },
      env: playwrightEnv.join("\n"),
    },
  });

  const commonEnv = [
    `REDIS_URL=redis://default:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379`,
    `REDIS_RATE_LIMIT_URL=redis://default:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379`,
    `PLAYWRIGHT_MICROSERVICE_URL=http://$(PROJECT_NAME)_${input.appServiceName}-playwright:3000/scrape`,
    `POSTGRES_USER=postgres`,
    `POSTGRES_PASSWORD=${postgresPassword}`,
    `POSTGRES_DB=postgres`,
    `POSTGRES_HOST=$(PROJECT_NAME)_${input.appServiceName}-postgres`,
    `POSTGRES_PORT=5432`,
    `USE_DB_AUTHENTICATION=false`,
    `NUM_WORKERS_PER_QUEUE=${input.numWorkersPerQueue || 8}`,
    `CRAWL_CONCURRENT_REQUESTS=${input.crawlConcurrentRequests || 10}`,
    `MAX_CONCURRENT_JOBS=${input.maxConcurrentJobs || 5}`,
    `BROWSER_POOL_SIZE=${input.browserPoolSize || 5}`,
    `NUQ_RABBITMQ_URL=amqp://firecrawl:${rabbitmqPassword}@$(PROJECT_NAME)_${input.appServiceName}-rabbitmq:5672`,
    `BULL_AUTH_KEY=${bullAuthKey}`,
    `TEST_API_KEY=${testApiKey}`,
    `LOGGING_LEVEL=info`,
  ];

  if (input.openaiApiKey) {
    commonEnv.push(`OPENAI_API_KEY=${input.openaiApiKey}`);
  }
  if (input.openaiBaseUrl) {
    commonEnv.push(`OPENAI_BASE_URL=${input.openaiBaseUrl}`);
  }
  if (input.modelName) {
    commonEnv.push(`MODEL_NAME=${input.modelName}`);
  }
  if (input.modelEmbeddingName) {
    commonEnv.push(`MODEL_EMBEDDING_NAME=${input.modelEmbeddingName}`);
  }
  if (input.ollamaBaseUrl) {
    commonEnv.push(`OLLAMA_BASE_URL=${input.ollamaBaseUrl}`);
  }

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
          port: 3002,
        },
      ],
      deploy: {
        command: "node dist/src/harness.js --start-docker",
      },
      env: [
        `HOST=0.0.0.0`,
        `PORT=3002`,
        `EXTRACT_WORKER_PORT=3004`,
        `WORKER_PORT=3005`,
        `ENV=production`,
        ...commonEnv,
      ].join("\n"),
    },
  });

  return { services };
}
