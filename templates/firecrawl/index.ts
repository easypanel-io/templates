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
  const rabbitmqPassword = randomPassword();
  const bullAuthKey = randomString(32);
  const testApiKey = randomString(32);
  const nuqDbPassword = randomPassword();

  const base = `$(PROJECT_NAME)_${input.appServiceName}`;
  const rabbitmqUser = "firecrawl";

  const commonEnv = [
    `REDIS_URL=redis://default:${redisPassword}@${base}-redis:6379`,
    `REDIS_RATE_LIMIT_URL=redis://default:${redisPassword}@${base}-redis:6379`,
    `PLAYWRIGHT_MICROSERVICE_URL=http://${base}-playwright:3000/scrape`,
    `NUQ_DATABASE_URL=postgresql://postgres:${nuqDbPassword}@${base}-nuq-postgres:5432/postgres`,
    "POSTGRES_USER=postgres",
    `POSTGRES_PASSWORD=${nuqDbPassword}`,
    "POSTGRES_DB=postgres",
    `POSTGRES_HOST=${base}-nuq-postgres`,
    "POSTGRES_PORT=5432",
    `NUQ_RABBITMQ_URL=amqp://${rabbitmqUser}:${rabbitmqPassword}@${base}-rabbitmq:5672`,
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
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: "node dist/src/harness.js --start-docker",
      },
      env: ["HOST=0.0.0.0", "PORT=3002", "INTERNAL_PORT=3002", commonEnv].join(
        "\n"
      ),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3002,
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
        image: input.playwrightServiceImage,
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

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-rabbitmq`,
      source: {
        type: "image",
        image: input.rabbitmqImage,
      },
      env: [
        `RABBITMQ_DEFAULT_USER=${rabbitmqUser}`,
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
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-nuq-postgres`,
      password: nuqDbPassword,
      image: input.nuqPostgresImage,
      databaseName: "postgres",
    },
  });

  return { services };
}
