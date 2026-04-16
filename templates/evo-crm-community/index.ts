import { randomBytes, randomUUID } from "crypto";
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

  const secretKeyBase = randomString(128);
  const jwtSecretKey = secretKeyBase;
  const doorkeeperJwtSecretKey = secretKeyBase;
  const evoaiCrmApiToken = randomUUID();
  const botRuntimeSecret = randomString(64);
  const encryptionKey = randomBytes(32).toString("base64");

  const frontendServiceName = `${input.serviceName}-frontend`;
  const gatewayServiceName = `${input.serviceName}-gateway`;
  const authServiceName = `${input.serviceName}-auth`;
  const authWorkerServiceName = `${input.serviceName}-auth-worker`;
  const crmServiceName = `${input.serviceName}-crm`;
  const crmWorkerServiceName = `${input.serviceName}-crm-worker`;
  const coreServiceName = `${input.serviceName}-core`;
  const processorServiceName = `${input.serviceName}-processor`;
  const botRuntimeServiceName = `${input.serviceName}-bot-runtime`;
  const postgresServiceName = `${input.serviceName}-db`;
  const redisServiceName = `${input.serviceName}-redis`;

  const postgresHost = `$(PROJECT_NAME)_${postgresServiceName}`;
  const redisHost = `$(PROJECT_NAME)_${redisServiceName}`;

  const frontendPublicUrl = `https://$(PROJECT_NAME)-${frontendServiceName}.$(EASYPANEL_HOST)`;
  const gatewayPublicUrl = `https://$(PROJECT_NAME)-${gatewayServiceName}.$(EASYPANEL_HOST)`;
  const corsOrigins = `${frontendPublicUrl},${gatewayPublicUrl}`;

  const sharedAuthEnv = [
    `RAILS_ENV=production`,
    `RAILS_MAX_THREADS=5`,
    `SECRET_KEY_BASE=${secretKeyBase}`,
    `JWT_SECRET_KEY=${jwtSecretKey}`,
    `EVOAI_CRM_API_TOKEN=${evoaiCrmApiToken}`,
    `POSTGRES_HOST=${postgresHost}`,
    `POSTGRES_PORT=5432`,
    `POSTGRES_USERNAME=postgres`,
    `POSTGRES_PASSWORD=${postgresPassword}`,
    `POSTGRES_DATABASE=$(PROJECT_NAME)`,
    `POSTGRES_SSLMODE=disable`,
    `REDIS_URL=redis://:${redisPassword}@${redisHost}:6379/0`,
    `MAILER_SENDER_EMAIL=${input.mailerSenderEmail}`,
    `SMTP_ADDRESS=${input.smtpAddress}`,
    `SMTP_PORT=${input.smtpPort}`,
    `SMTP_DOMAIN=${input.smtpDomain}`,
    `SMTP_AUTHENTICATION=${input.smtpAuthentication}`,
    `SMTP_ENABLE_STARTTLS_AUTO=${input.smtpEnableStarttlsAuto}`,
    `SMTP_USERNAME=${input.smtpUsername}`,
    `SMTP_PASSWORD=${input.smtpPassword}`,
    `DOORKEEPER_JWT_SECRET_KEY=${doorkeeperJwtSecretKey}`,
    `DOORKEEPER_JWT_ALGORITHM=hs256`,
    `DOORKEEPER_JWT_ISS=evo-auth-service`,
    `MFA_ISSUER=${input.mfaIssuer}`,
    `SIDEKIQ_CONCURRENCY=${input.sidekiqConcurrency}`,
    `ACTIVE_STORAGE_SERVICE=${input.activeStorageService}`,
  ];

  const sharedCrmEnv = [
    `RAILS_ENV=production`,
    `RAILS_SERVE_STATIC_FILES=true`,
    `RAILS_LOG_TO_STDOUT=true`,
    `SECRET_KEY_BASE=${secretKeyBase}`,
    `JWT_SECRET_KEY=${jwtSecretKey}`,
    `EVOAI_CRM_API_TOKEN=${evoaiCrmApiToken}`,
    `POSTGRES_HOST=${postgresHost}`,
    `POSTGRES_PORT=5432`,
    `POSTGRES_USERNAME=postgres`,
    `POSTGRES_PASSWORD=${postgresPassword}`,
    `POSTGRES_DATABASE=$(PROJECT_NAME)`,
    `POSTGRES_SSLMODE=disable`,
    `REDIS_URL=redis://:${redisPassword}@${redisHost}:6379/0`,
    `EVO_AUTH_SERVICE_URL=http://$(PROJECT_NAME)_${authServiceName}:3001`,
    `EVO_AI_CORE_SERVICE_URL=http://$(PROJECT_NAME)_${coreServiceName}:5555`,
    `DISABLE_TELEMETRY=true`,
    `LOG_LEVEL=info`,
    `ENABLE_ACCOUNT_SIGNUP=true`,
    `ENABLE_PUSH_RELAY_SERVER=true`,
    `ENABLE_INBOX_EVENTS=true`,
    `BOT_RUNTIME_URL=http://$(PROJECT_NAME)_${botRuntimeServiceName}:8080`,
    `BOT_RUNTIME_SECRET=${botRuntimeSecret}`,
    `BOT_RUNTIME_POSTBACK_BASE_URL=http://$(PROJECT_NAME)_${crmServiceName}:3000`,
  ];

  services.push({
    type: "postgres",
    data: {
      serviceName: postgresServiceName,
      image: input.postgresImage,
      password: postgresPassword,
      env: `PGDATA=/var/lib/postgresql/data`,
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: redisServiceName,
      password: redisPassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: authServiceName,
      source: {
        type: "image",
        image: input.authImage,
      },
      env: [
        ...sharedAuthEnv,
        `FRONTEND_URL=${frontendPublicUrl}`,
        `BACKEND_URL=${gatewayPublicUrl}`,
        `CORS_ORIGINS=${corsOrigins}`,
      ].join("\n"),
      deploy: {
        command:
          "bash -c \"bundle exec rails db:migrate 2>&1 || echo 'Migration had errors, continuing...'; bundle exec rails s -p 3001 -b 0.0.0.0\"",
      },
      mounts: [
        {
          type: "volume",
          name: "storage",
          mountPath: "/app/storage",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: authWorkerServiceName,
      source: {
        type: "image",
        image: input.authImage,
      },
      env: [...sharedAuthEnv, `CORS_ORIGINS=${corsOrigins}`].join("\n"),
      deploy: {
        command: "bundle exec sidekiq -C config/sidekiq.yml",
      },
      mounts: [
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${authServiceName}/volumes/storage`,
          mountPath: "/app/storage",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: coreServiceName,
      source: {
        type: "image",
        image: input.coreImage,
      },
      env: [
        `DB_HOST=${postgresHost}`,
        `DB_PORT=5432`,
        `DB_USER=postgres`,
        `DB_PASSWORD=${postgresPassword}`,
        `DB_NAME=$(PROJECT_NAME)`,
        `DB_SSLMODE=disable`,
        `DB_MAX_IDLE_CONNS=10`,
        `DB_MAX_OPEN_CONNS=100`,
        `DB_CONN_MAX_LIFETIME=1h`,
        `DB_CONN_MAX_IDLE_TIME=30m`,
        `PORT=5555`,
        `SECRET_KEY_BASE=${secretKeyBase}`,
        `JWT_SECRET_KEY=${jwtSecretKey}`,
        `JWT_ALGORITHM=HS256`,
        `ENCRYPTION_KEY=${encryptionKey}`,
        `EVOLUTION_BASE_URL=http://$(PROJECT_NAME)_${crmServiceName}:3000`,
        `EVO_AUTH_BASE_URL=http://$(PROJECT_NAME)_${authServiceName}:3001`,
        `AI_PROCESSOR_URL=http://$(PROJECT_NAME)_${processorServiceName}:8000`,
        `AI_PROCESSOR_VERSION=v1`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: processorServiceName,
      source: {
        type: "image",
        image: input.processorImage,
      },
      env: [
        `POSTGRES_CONNECTION_STRING=postgresql://postgres:${postgresPassword}@${postgresHost}:5432/$(PROJECT_NAME)?sslmode=disable`,
        `REDIS_HOST=${redisHost}`,
        `REDIS_PORT=6379`,
        `REDIS_PASSWORD=${redisPassword}`,
        `REDIS_SSL=false`,
        `REDIS_DB=0`,
        `REDIS_KEY_PREFIX=a2a:`,
        `REDIS_TTL=3600`,
        `HOST=0.0.0.0`,
        `PORT=8000`,
        `DEBUG=false`,
        `SECRET_KEY_BASE=${secretKeyBase}`,
        `ENCRYPTION_KEY=${encryptionKey}`,
        `EVOAI_CRM_API_TOKEN=${evoaiCrmApiToken}`,
        `EVO_AI_CRM_URL=http://$(PROJECT_NAME)_${crmServiceName}:3000`,
        `CORE_SERVICE_URL=http://$(PROJECT_NAME)_${coreServiceName}:5555/api/v1`,
        `APP_URL=${gatewayPublicUrl}`,
        `API_TITLE=Agent Processor Community`,
        `API_DESCRIPTION=Agent Processor Community for Evo AI`,
        `API_VERSION=1.0.0`,
        `API_URL=${gatewayPublicUrl}`,
        `ORGANIZATION_NAME=${input.organizationName}`,
        `TOOLS_CACHE_ENABLED=true`,
        `TOOLS_CACHE_TTL=3600`,
      ].join("\n"),
      deploy: {
        command:
          "sh -c \"alembic upgrade head 2>&1 || echo 'Alembic migration had errors, continuing...'; python -m scripts.run_seeders; uvicorn src.main:app --host $HOST --port $PORT\"",
      },
      mounts: [
        {
          type: "volume",
          name: "logs",
          mountPath: "/app/logs",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: botRuntimeServiceName,
      source: {
        type: "image",
        image: input.botRuntimeImage,
      },
      env: [
        `LISTEN_ADDR=0.0.0.0:8080`,
        `REDIS_URL=redis://:${redisPassword}@${redisHost}:6379/0`,
        `AI_PROCESSOR_URL=http://$(PROJECT_NAME)_${processorServiceName}:8000`,
        `BOT_RUNTIME_SECRET=${botRuntimeSecret}`,
        `AI_CALL_TIMEOUT_SECONDS=30`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: crmServiceName,
      source: {
        type: "image",
        image: input.crmImage,
      },
      env: [
        ...sharedCrmEnv,
        `BACKEND_URL=${gatewayPublicUrl}`,
        `FRONTEND_URL=${frontendPublicUrl}`,
        `CORS_ORIGINS=${corsOrigins}`,
      ].join("\n"),
      deploy: {
        command: `sh -c "until wget -qO- http://$(PROJECT_NAME)_${authServiceName}:3001/health >/dev/null 2>&1; do echo 'Waiting for auth...'; sleep 5; done; bundle exec rails db:migrate 2>&1 || echo 'Migration had errors, continuing...'; bundle exec rails s -p 3000 -b 0.0.0.0"`,
      },
      mounts: [
        {
          type: "volume",
          name: "storage",
          mountPath: "/app/storage",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: crmWorkerServiceName,
      source: {
        type: "image",
        image: input.crmImage,
      },
      env: [...sharedCrmEnv, `CORS_ORIGINS=${corsOrigins}`].join("\n"),
      deploy: {
        command: "bundle exec sidekiq -C config/sidekiq.yml",
      },
      mounts: [
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${crmServiceName}/volumes/storage`,
          mountPath: "/app/storage",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: gatewayServiceName,
      source: {
        type: "image",
        image: input.gatewayImage,
      },
      env: [
        `AUTH_UPSTREAM=$(PROJECT_NAME)_${authServiceName}:3001`,
        `CRM_UPSTREAM=$(PROJECT_NAME)_${crmServiceName}:3000`,
        `CORE_UPSTREAM=$(PROJECT_NAME)_${coreServiceName}:5555`,
        `PROCESSOR_UPSTREAM=$(PROJECT_NAME)_${processorServiceName}:8000`,
        `BOT_RUNTIME_UPSTREAM=$(PROJECT_NAME)_${botRuntimeServiceName}:8080`,
      ].join("\n"),
      domains: [
        {
          host: `$(PROJECT_NAME)-${gatewayServiceName}.$(EASYPANEL_HOST)`,
          port: 3030,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: frontendServiceName,
      source: {
        type: "image",
        image: input.frontendImage,
      },
      env: [
        `VITE_APP_ENV=production`,
        `VITE_API_URL=${gatewayPublicUrl}`,
        `VITE_AUTH_API_URL=${gatewayPublicUrl}`,
        `VITE_EVOAI_API_URL=${gatewayPublicUrl}`,
        `VITE_AGENT_PROCESSOR_URL=${gatewayPublicUrl}`,
        `VITE_WS_URL=${gatewayPublicUrl}`,
        `VITE_TINYMCE_API_KEY=no-api-key`,
      ].join("\n"),
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
