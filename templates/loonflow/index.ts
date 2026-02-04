import {
  Output,
  randomPassword,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const postgresPassword = randomPassword();
  const redisPassword = randomPassword();
  const adminPassword = input.adminPassword || randomPassword();

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-pg`,
      password: postgresPassword,
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      password: redisPassword,
    },
  });

  const backendEnv = [
    `DB_NAME=${input.postgresDb}`,
    `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-pg`,
    `DB_USER=postgres`,
    `DB_PASS=${postgresPassword}`,
    `REDIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
    `REDIS_PASS=${redisPassword}`,
    `DJANGO_SUPERUSER_PASSWORD=${adminPassword}`,
    `TENANT_NAME=${input.tenantName}`,
    `TENANT_DOMAIN=http://$(PRIMARY_DOMAIN)`,
  ];

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-backend`,
      source: {
        type: "image",
        image: input.backendImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      env: backendEnv.join("\n"),
      deploy: {
        command: `sh -c "python manage.py makemigrations && python manage.py migrate && python manage.py createsuperuser --noinput --email ${input.adminEmail} --name ${input.adminName} || true && gunicorn --bind 0.0.0.0:8000 --workers 4 --chdir /app/loonflow --pythonpath /app/loonflow --access-logfile - --error-logfile - --log-level info loonflow.wsgi:application"`,
      },
    },
  });

  const taskEnv = [
    `DB_NAME=$(PROJECT_NAME)`,
    `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-pg`,
    `DB_USER=postgres`,
    `DB_PASS=${postgresPassword}`,
    `REDIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
    `REDIS_PASS=${redisPassword}`,
  ];

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-task`,
      source: {
        type: "image",
        image: input.backendImage,
      },
      env: taskEnv.join("\n"),
      deploy: {
        command: `sh -c "cd /app/loonflow && celery -A tasks worker -l info -c 8 -Q loonflow"`,
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-ui`,
      source: {
        type: "image",
        image: input.uiImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
    },
  });

  return { services };
}
