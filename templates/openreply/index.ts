import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

function randomHex(length: number) {
  const chars = "abcdef0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();
  const nextAuthSecret = randomString(48);
  const cronSecret = randomString(48);
  const encryptionKey = randomHex(64);
  const databaseUrl = `postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`;
  const redisUrl = `redis://default:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379`;
  const appUrl = "https://$(EASYPANEL_DOMAIN)";

  const commonEnv = [
    `NIXPACKS_NODE_VERSION=22`,
    `NEXTAUTH_URL=${appUrl}`,
    `NEXTAUTH_SECRET=${nextAuthSecret}`,
    `CRON_SECRET=${cronSecret}`,
    `ENCRYPTION_KEY=${encryptionKey}`,
    `DATABASE_URL=${databaseUrl}`,
    `REDIS_URL=${redisUrl}`,
    `RESEND_API_KEY=${input.resendApiKey}`,
    `EMAIL_FROM=${input.emailFrom}`,
    `META_GRAPH_API_VERSION=${input.metaGraphApiVersion}`,
    `INSTAGRAM_APP_ID=${input.instagramAppId}`,
    `INSTAGRAM_APP_SECRET=${input.instagramAppSecret}`,
    `FACEBOOK_APP_SECRET=${input.facebookAppSecret}`,
    `WEBHOOK_VERIFY_TOKEN=${input.webhookVerifyToken}`,
  ].join("\n");

  const source = {
    type: "github" as const,
    owner: "diwenne",
    repo: "openreply",
    ref: input.sourceRef,
    path: "/",
    autoDeploy: false,
  };

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      image: "postgres:16",
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

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source,
      build: {
        type: "nixpacks",
        installCommand: "npm ci",
        buildCommand: "npm run build",
        startCommand: "npm run start",
      },
      env: commonEnv,
      deploy: {
        replicas: 1,
        command: "npx prisma migrate deploy && npm run start",
        zeroDowntime: true,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-worker`,
      source,
      build: {
        type: "nixpacks",
        installCommand: "npm ci",
        buildCommand: "npm run db:generate",
        startCommand: "npm run worker",
      },
      env: commonEnv,
      deploy: {
        replicas: 1,
        command: "npm run worker",
        zeroDowntime: false,
      },
    },
  });

  return { services };
}
