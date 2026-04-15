import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const mongoPassword = randomPassword();
  const jwtSecret = randomString(32);
  const storeEncryptionKey = randomString(32);
  const novuSecretKey = randomString(32);
  const redisPassword = randomString(32);

  const commonEnv = [
    `NODE_ENV=production`,
    `MONGO_URL=mongodb://mongo:${mongoPassword}@$(PROJECT_NAME)_${input.appServiceName}-mongodb:27017/$(PROJECT_NAME)?authSource=admin`,
    `MONGO_MIN_POOL_SIZE=5`,
    `MONGO_MAX_POOL_SIZE=10`,
    `REDIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
    `REDIS_PORT=6379`,
    `REDIS_PASSWORD=${redisPassword}`,
    `NEW_RELIC_ENABLED=false`,
    `API_ROOT_URL=https://$(PROJECT_NAME)-${input.appServiceName}-api.$(EASYPANEL_HOST)`,
  ];

  const apiWorkerCommonEnv = [
    `REDIS_DB_INDEX=2`,
    `REDIS_CACHE_SERVICE_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
    `REDIS_CACHE_SERVICE_PORT=6379`,
    `S3_LOCAL_STACK=false`,
    `S3_BUCKET_NAME=novu-local`,
    `S3_REGION=us-east-1`,
    `AWS_ACCESS_KEY_ID=test`,
    `AWS_SECRET_ACCESS_KEY=test`,
    `STORE_ENCRYPTION_KEY=${storeEncryptionKey}`,
    `SUBSCRIBER_WIDGET_JWT_EXPIRATION_TIME=15d`,
  ];

  services.push({
    type: "mongo",
    data: {
      serviceName: `${input.appServiceName}-mongodb`,
      password: mongoPassword,
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
      serviceName: `${input.appServiceName}-api`,
      source: {
        type: "image",
        image: input.apiServiceImage,
      },
      env: [
        ...commonEnv,
        ...apiWorkerCommonEnv,
        `PORT=3000`,
        `FRONT_BASE_URL=https://$(PROJECT_NAME)-${input.appServiceName}-dashboard.$(EASYPANEL_HOST)`,
        `JWT_SECRET=${jwtSecret}`,
        `NOVU_SECRET_KEY=${novuSecretKey}`,
        `API_CONTEXT_PATH=`,
        `MONGO_AUTO_CREATE_INDEXES=true`,
        `IS_API_IDEMPOTENCY_ENABLED=false`,
        `IS_API_RATE_LIMITING_ENABLED=false`,
        `IS_NEW_MESSAGES_API_RESPONSE_ENABLED=true`,
        `IS_V2_ENABLED=true`,
      ].join("\n"),
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
      source: {
        type: "image",
        image: input.workerServiceImage,
      },
      env: [
        ...commonEnv,
        ...apiWorkerCommonEnv,
        `BROADCAST_QUEUE_CHUNK_SIZE=100`,
        `MULTICAST_QUEUE_CHUNK_SIZE=100`,
        `IS_EMAIL_INLINE_CSS_DISABLED=false`,
        `IS_USE_MERGED_DIGEST_ID_ENABLED=false`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-ws`,
      source: {
        type: "image",
        image: input.wsServiceImage,
      },
      env: [
        ...commonEnv,
        `PORT=3002`,
        `JWT_SECRET=${jwtSecret}`,
        `WS_CONTEXT_PATH=`,
      ].join("\n"),
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
      serviceName: `${input.appServiceName}-dashboard`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `PORT=4000`,
        `VITE_API_HOSTNAME=https://$(PROJECT_NAME)-${input.appServiceName}-api.$(EASYPANEL_HOST)`,
        `VITE_SELF_HOSTED=true`,
        `VITE_WEBSOCKET_HOSTNAME=https://$(PROJECT_NAME)-${input.appServiceName}-ws.$(EASYPANEL_HOST)`,
        `VITE_LEGACY_DASHBOARD_URL=https://$(PROJECT_NAME)-${input.appServiceName}-dashboard.$(EASYPANEL_HOST)`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 4000,
        },
      ],
    },
  });

  return { services };
}
