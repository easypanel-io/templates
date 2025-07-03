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
  const redisPassword = randomPassword();
  const dbEncryptionPassword = randomString(32);
  const dbEncryptionSalt = randomString(32);
  const apiKeySecret = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-api-service`,
      source: {
        type: "image",
        image: input.apiServiceImage,
      },
      env: [
        `LOWCODER_PUBLIC_URL=https://$(PRIMARY_DOMAIN)`,
        `LOWCODER_PUID=9001`,
        `LOWCODER_PGID=9001`,
        `LOWCODER_MONGODB_URL=mongodb://mongo:${mongoPassword}@$(PROJECT_NAME)-${input.appServiceName}-mongodb:27017/$(PROJECT_NAME)?authSource=admin`,
        `LOWCODER_REDIS_URL=redis://default:${redisPassword}@$(PROJECT_NAME)-${input.appServiceName}-redis:6379`,
        `LOWCODER_NODE_SERVICE_URL=http://$(PROJECT_NAME)-${input.appServiceName}-node-service:6060`,
        `LOWCODER_MAX_QUERY_TIMEOUT=120`,
        `LOWCODER_MAX_REQUEST_SIZE=20m`,
        `LOWCODER_EMAIL_AUTH_ENABLED=true`,
        `LOWCODER_EMAIL_SIGNUP_ENABLED=true`,
        `LOWCODER_CREATE_WORKSPACE_ON_SIGNUP=true`,
        `LOWCODER_DB_ENCRYPTION_PASSWORD=${dbEncryptionPassword}`,
        `LOWCODER_DB_ENCRYPTION_SALT=${dbEncryptionSalt}`,
        `LOWCODER_CORS_DOMAINS=*`,
        `LOWCODER_MAX_ORGS_PER_USER=100`,
        `LOWCODER_MAX_MEMBERS_PER_ORG=1000`,
        `LOWCODER_MAX_GROUPS_PER_ORG=100`,
        `LOWCODER_MAX_APPS_PER_ORG=1000`,
        `LOWCODER_MAX_DEVELOPERS=50`,
        `LOWCODER_API_KEY_SECRET=${apiKeySecret}`,
        `LOWCODER_PLUGINS_DIR=../plugins`,
        `LOWCODER_API_RATE_LIMIT=50`,
        `LOWCODER_WORKSPACE_MODE=SAAS`,
        `LOWCODER_MARKETPLACE_PRIVATE_MODE=true`,
        `LOWCODER_ADMIN_SMTP_HOST=${input.smtpHost}`,
        `LOWCODER_ADMIN_SMTP_PORT=${input.smtpPort}`,
        `LOWCODER_ADMIN_SMTP_USERNAME=${input.smtpUsername}`,
        `LOWCODER_ADMIN_SMTP_PASSWORD=${input.smtpPassword}`,
        `LOWCODER_ADMIN_SMTP_AUTH=true`,
        `LOWCODER_ADMIN_SMTP_SSL_ENABLED=false`,
        `LOWCODER_ADMIN_SMTP_STARTTLS_ENABLED=true`,
        `LOWCODER_ADMIN_SMTP_STARTTLS_REQUIRED=true`,
        `LOWCODER_EMAIL_NOTIFICATIONS_SENDER=${input.notificationSender}`,
        `LOWCODER_SUPERUSER_USERNAME=${input.superuserUsername}`,
        `LOWCODER_SUPERUSER_PASSWORD=${input.superuserPassword}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "stacks",
          mountPath: "/lowcoder-stacks",
        },
        {
          type: "volume",
          name: "assets",
          mountPath: "/lowcoder/assets",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-node-service`,
      source: {
        type: "image",
        image: input.nodeServiceImage,
      },
      env: [
        `LOWCODER_PUID=9001`,
        `LOWCODER_PGID=9001`,
        `LOWCODER_API_SERVICE_URL=http://$(PROJECT_NAME)_${input.appServiceName}-api-service:8080`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-frontend`,
      source: {
        type: "image",
        image: input.frontendImage,
      },
      env: [
        `LOWCODER_PUID=9001`,
        `LOWCODER_PGID=9001`,
        `LOWCODER_MAX_REQUEST_SIZE=20m`,
        `LOWCODER_MAX_QUERY_TIMEOUT=120`,
        `LOWCODER_API_SERVICE_URL=http://$(PROJECT_NAME)_${input.appServiceName}-api-service:8080`,
        `LOWCODER_NODE_SERVICE_URL=http://$(PROJECT_NAME)_${input.appServiceName}-node-service:6060`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "assets",
          mountPath: "/lowcoder/assets",
        },
      ],
    },
  });

  services.push({
    type: "mongo",
    data: {
      serviceName: `${input.appServiceName}-mongodb`,
      password: mongoPassword,
      image: "mongo:7.0",
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      password: redisPassword,
    },
  });

  return { services };
}
