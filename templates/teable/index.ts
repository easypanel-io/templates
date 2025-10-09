import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secretKey = randomString(32);

  const envs = [
    `PUBLIC_ORIGIN=https://$(PRIMARY_DOMAIN)`,
    `SECRET_KEY=${secretKey}`,
    `TIMEZONE=UTC`,
    `NEXT_ENV_IMAGES_ALL_REMOTE=true`,
    `# SMTP`,
    `#BACKEND_MAIL_HOST=smtp.teable.io`,
    `#BACKEND_MAIL_PORT=465`,
    `#BACKEND_MAIL_SECURE=true`,
    `#BACKEND_MAIL_SENDER=noreply.teable.io`,
    `#BACKEND_MAIL_SENDER_NAME=Teable`,
    `#BACKEND_MAIL_AUTH_USER=username`,
  ];

  // Redis
  const redisServiceName = input.appServiceName + '-redis';
  const redisHost = `$(PROJECT_NAME)_${redisServiceName}`;
  const redisPassword = randomPassword();
  
  services.push({
    type: "redis",
    data: {
      serviceName: redisServiceName,
      password: redisPassword
    },
  });

  envs.push('# Redis');
  envs.push(`REDIS_HOST=${redisHost}`);
  envs.push(`REDIS_PASSWORD=${redisPassword}`);
  envs.push(`REDIS_PORT=6379`);
  envs.push(`REDIS_DB=0`);

  // Database
  const databaseServiceName = input.appServiceName + '-db';
  const databaseHost = `$(PROJECT_NAME)_${databaseServiceName}`;
  const databasePassword = randomPassword();

  services.push({
    type: "postgres",
    data: {
      serviceName: databaseServiceName,
      password: databasePassword,
    },
  });

  envs.push('# Database');
  envs.push(`POSTGRES_HOST=${databaseHost}`);
  envs.push(`POSTGRES_PORT=5432`);
  envs.push(`POSTGRES_DB=$(PROJECT_NAME)`);
  envs.push(`POSTGRES_USER=postgres`);
  envs.push(`POSTGRES_PASSWORD=${databasePassword}`);
  
  // Service
  envs.push(`# App`);
  envs.push(`PRISMA_DATABASE_URL=postgresql://postgres:${databasePassword}@${databaseHost}:5432/$(PROJECT_NAME)`);
  envs.push(`BACKEND_CACHE_PROVIDER=redis`);
  envs.push(`BACKEND_CACHE_REDIS_URI=redis://default:${redisPassword}@${redisHost}:6379/0`);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: envs.join("\n"),
      source: {
        type: "image",
        image: `${input.appServiceImage}${input.enableArm ? "-arm64" : ""}`,
      },
      domains: [{
        host: "$(EASYPANEL_DOMAIN)",
        port: 3000,
      }, ],
      mounts: [{
        type: "volume",
        name: "teable-data",
        mountPath: "/app/.assets",
      }],
    },
  });

  return { services };
}
