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

  const bullAuthKey = randomString(16);
  const testApiKey = randomString(16);
  const redisPassword = randomPassword();
  const nuqDbPassword = randomPassword();

  const base = `$(PROJECT_NAME)_${input.appServiceName}`;

  const commonEnvs = [
    `REDIS_URL=redis://default:${redisPassword}@${base}-redis:6379`,
    `REDIS_RATE_LIMIT_URL=redis://default:${redisPassword}@${base}-redis:6379`,
    `PLAYWRIGHT_MICROSERVICE_URL=http://${base}-playwright:3000/scrape`,
    `NUQ_DATABASE_URL=postgres://postgres:${nuqDbPassword}@${base}-nuq-postgres:5432/postgres`,
    "POSTGRES_USER=postgres",
    `POSTGRES_PASSWORD=${nuqDbPassword}`,
    "POSTGRES_DB=postgres",
    `POSTGRES_HOST=${base}-nuq-postgres`,
    "POSTGRES_PORT=5432",
    `NUQ_RABBITMQ_URL=amqp://${base}-rabbitmq:5672`,
    "USE_DB_AUTHENTICATION=false",
    `BULL_AUTH_KEY=${bullAuthKey}`,
    `TEST_API_KEY=${testApiKey}`,
    "LOGGING_LEVEL=info",
    "NUM_WORKERS_PER_QUEUE=8",
    "CRAWL_CONCURRENT_REQUESTS=10",
    "MAX_CONCURRENT_JOBS=5",
    "BROWSER_POOL_SIZE=5",
    "EXTRACT_WORKER_PORT=3004",
    "WORKER_PORT=3005",
    "ENV=local",
  ].join("\n");

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-rabbitmq`,
      source: {
        type: "image",
        image: input.appServiceImage ?? "ghcr.io/firecrawl/firecrawl:latest",
      },
      deploy: {
        command: "node dist/src/harness.js --start-docker",
      },
      env: ["HOST=0.0.0.0", "PORT=3002", "INTERNAL_PORT=3002", commonEnvs].join(
        "\n"
      ),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3002,
        },
      ],
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
      serviceName: `${input.appServiceName}-playwright`,
      source: {
        type: "image",
        image:
          input.playwrightServiceImage ??
          "ghcr.io/firecrawl/playwright-service:latest",
      },
      env: ["PORT=3000", "BLOCK_MEDIA=false", "MAX_CONCURRENT_PAGES=10"].join(
        "\n"
      ),
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      password: redisPassword,
      image: input.redisImage ?? "redis:alpine",
    },
  });

  const playwrightEnv = [
    `PORT=3000`,
    `MAX_CONCURRENT_PAGES=${input.crawlConcurrentRequests || 10}`,
  ];

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-rabbitmq`,
      source: {
        type: "image",
        image: input.rabbitmqImage ?? "rabbitmq:3-management",
      },
      deploy: {
        command: "rabbitmq-server",
      },
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
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-nuq-postgres`,
      password: nuqDbPassword,
      image: input.nuqPostgresImage ?? "ghcr.io/firecrawl/nuq-postgres:latest",
      databaseName: "postgres",
    },
  });

  return { services };
}
