import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secretKey = randomPassword() + randomPassword() + randomPassword();
  const redisPassword = randomPassword();

  // Redis
  services.push({
    type: "redis",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      password: redisPassword,
    },
  });

  // Celery Worker
  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-worker`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: "/opt/venv/bin/python -m celery -A app.core.celery_app worker --loglevel=info",
      },
      env: [
        `SERVICE_ROLE=celery-worker`,
        `ENVIRONMENT=production`,
        `SECRET_KEY=${secretKey}`,
        `DOMAIN_NAME=$(PROJECT_NAME)-${input.appServiceName}.$(EASYPANEL_HOST)`,
        `REDIS_URL=redis://:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379/0`,
        `CELERY_BROKER_URL=redis://:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379/0`,
        `CELERY_RESULT_BACKEND=redis://:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379/0`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
    },
  });

  // Main App
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
          port: 8000,
        },
      ],
      env: [
        `SERVICE_ROLE=app`,
        `ENVIRONMENT=production`,
        `SECRET_KEY=${secretKey}`,
        `DOMAIN_NAME=$(PRIMARY_DOMAIN)`,
        `REDIS_URL=redis://:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379/0`,
        `CELERY_BROKER_URL=redis://:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379/0`,
        `CELERY_RESULT_BACKEND=redis://:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379/0`,
        `RATE_LIMIT_STORAGE_URI=redis://:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379/1`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
    },
  });

  return { services };
}
