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
  const cookieSecret = randomString(32);
  const redisPassword = randomPassword();
  const basicAuthHash = randomString(32);

  const commonEnvVars = [
    `NODE_ENV=production`,
    `SELF_HOSTED=true`,
    `GEO_IP_HOST=http://$(PROJECT_NAME)_${input.appServiceName}-geo:8080`,
    `BATCH_SIZE=5000`,
    `BATCH_INTERVAL=10000`,
    `ALLOW_REGISTRATION=true`,
    `ALLOW_INVITATION=true`,
    `REDIS_URL=redis://default:${redisPassword}@$(PROJECT_NAME)-${input.appServiceName}-redis:6379`,
    `CLICKHOUSE_URL=http://$(PROJECT_NAME)_${input.appServiceName}-ch:8123`,
    `DATABASE_URL=postgresql://postgres:${postgresPassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)?schema=public`,
    `DATABASE_URL_DIRECT=postgresql://postgres:${postgresPassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)?schema=public`,
    `NEXT_PUBLIC_DASHBOARD_URL=https://${input.appDomain}`,
    `NEXT_PUBLIC_API_URL=https://${input.appDomain}/api`,
    `COOKIE_SECRET=${cookieSecret}`,
    `EMAIL_SENDER=${input.emailSender || "noreply@example.com"}`,
    input.resendApiKey
      ? `RESEND_API_KEY=${input.resendApiKey}`
      : `# RESEND_API_KEY=`,
  ];

  const caddyFile = `
http://{$PRIMARY_DOMAIN} {
    
    handle_path /api* {
        reverse_proxy {$API_URL}:3000
    }

    reverse_proxy /* {$DASHBOARD_URL}:3000
}

http://worker.{$PRIMARY_DOMAIN} {

    basic_auth {
        admin $2b$10$wZt0R0wkz0QaKe0HdLd2mO8gnqyz8QEt9bSzc7apFrfWHdWI.I0ZG
    }

    reverse_proxy {$WORKER_URL}:3000
}
  
  `;

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-caddy`,
      env: [
        `API_URL=$(PROJECT_NAME)-${input.appServiceName}-api`,
        `DASHBOARD_URL=$(PROJECT_NAME)-${input.appServiceName}-dashboard`,
        `WORKER_URL=$(PROJECT_NAME)-${input.appServiceName}-worker`,
        `BASIC_AUTH_HASH=${basicAuthHash}`,
        `PRIMARY_DOMAIN=${input.appDomain}`,
      ].join("\n"),
      source: { type: "image", image: "caddy:2.8-alpine" },
      domains: [
        {
          host: input.appDomain,
          port: 80,
        },
        {
          host: `worker.${input.appDomain}`,
          port: 80,
        },
      ],
      mounts: [
        {
          type: "file",
          content: caddyFile,
          mountPath: "/etc/caddy/Caddyfile",
        },
        {
          type: "volume",
          name: "caddy-data",
          mountPath: "/data",
        },
        {
          type: "volume",
          name: "caddy-config",
          mountPath: "/config",
        },
      ],
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
      deploy: {
        command: `sh -c "echo 'Waiting for PostgreSQL to be ready...' && while ! nc -z $(PROJECT_NAME)_${input.appServiceName}-db 5432; do sleep 1; done && echo 'PostgreSQL is ready' && echo 'Waiting for ClickHouse to be ready...' && while ! nc -z $(PROJECT_NAME)_${input.appServiceName}-ch 8123; do sleep 1; done && echo 'ClickHouse is ready' && echo 'Running migrations...' && CI=true pnpm -r run migrate:deploy && pnpm start"`,
      },
      env: commonEnvVars.join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-dashboard`,
      source: {
        type: "image",
        image: input.dashboardServiceImage,
      },
      env: commonEnvVars.join("\n"),
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
      env: commonEnvVars.join("\n"),
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
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

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-geo`,
      source: {
        type: "image",
        image: input.geoipServiceImage,
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-ch`,
      source: {
        type: "image",
        image: input.clickhouseServiceImage,
      },
      mounts: [
        {
          type: "volume",
          name: "ch-data",
          mountPath: "/var/lib/clickhouse",
        },
        {
          type: "volume",
          name: "ch-logs",
          mountPath: "/var/log/clickhouse-server",
        },
        {
          type: "volume",
          name: "ch-config",
          mountPath: "/etc/clickhouse-server/config.d",
        },
        {
          type: "volume",
          name: "ch-users",
          mountPath: "/etc/clickhouse-server/users.d",
        },
        {
          type: "volume",
          name: "ch-init",
          mountPath: "/docker-entrypoint-initdb.d",
        },
      ],
    },
  });

  return { services };
}
