import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const dbPassword = randomPassword();
  const cachePassword = randomPassword();
  const secretKey = randomString(50);

  const dbServiceName = `${input.appServiceName}-db`;
  const cacheServiceName = `${input.appServiceName}-cache`;
  const apiServiceName = `${input.appServiceName}-api`;
  const workerServiceName = `${input.appServiceName}-worker`;
  const dashboardServiceName = `${input.appServiceName}-dashboard`;

  const databaseUrl = `postgres://postgres:${dbPassword}@$(PROJECT_NAME)_${dbServiceName}:5432/$(PROJECT_NAME)`;
  const cacheUrl = `redis://default:${cachePassword}@$(PROJECT_NAME)_${cacheServiceName}:6379/0`;
  const celeryBrokerUrl = `redis://default:${cachePassword}@$(PROJECT_NAME)_${cacheServiceName}:6379/1`;

  const sharedEnv = [
    `DATABASE_URL=${databaseUrl}`,
    `CACHE_URL=${cacheUrl}`,
    `CELERY_BROKER_URL=${celeryBrokerUrl}`,
    `SECRET_KEY=${secretKey}`,
    `DEFAULT_FROM_EMAIL=noreply@${input.apiDomain}`,
    `DEFAULT_CHANNEL_SLUG=default-channel`,
    `HTTP_IP_FILTER_ENABLED=False`,
    `ALLOWED_HOSTS=${input.apiDomain}`,
    `DASHBOARD_URL=https://${input.dashboardDomain}/`,
  ].join("\n");

  services.push({
    type: "app",
    data: {
      serviceName: apiServiceName,
      source: {
        type: "image",
        image: input.apiServiceImage,
      },
      deploy: {
        command:
          "python3 manage.py migrate && exec uvicorn saleor.asgi:application --host=0.0.0.0 --port=8000 --workers=2 --lifespan=auto --ws=none --no-server-header --no-access-log --timeout-keep-alive=35 --timeout-graceful-shutdown=30",
      },
      env: sharedEnv,
      domains: [
        {
          host: input.apiDomain,
          port: 8000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "media",
          mountPath: "/app/media",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: workerServiceName,
      source: {
        type: "image",
        image: input.apiServiceImage,
      },
      deploy: {
        command:
          'until python3 manage.py migrate --check > /dev/null 2>&1; do echo "Waiting for migrations"; sleep 5; done; exec celery -A saleor --app=saleor.celeryconf:app worker --loglevel=info -B',
      },
      env: sharedEnv,
      mounts: [
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${apiServiceName}/volumes/media`,
          mountPath: "/app/media",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: dashboardServiceName,
      source: {
        type: "image",
        image: input.dashboardServiceImage,
      },
      env: [`API_URL=https://${input.apiDomain}/graphql/`].join("\n"),
      domains: [
        {
          host: input.dashboardDomain,
          port: 80,
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: dbServiceName,
      password: dbPassword,
      image: input.dbServiceImage,
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: cacheServiceName,
      password: cachePassword,
      image: input.cacheServiceImage,
    },
  });

  return { services };
}
