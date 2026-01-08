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
  const secretKeyBase = randomString(64);
  const encryptionPrimaryKey = randomString(32);
  const encryptionDeterministicKey = randomString(32);
  const encryptionDerivationSalt = randomString(32);
  const redisPassword = randomPassword();

  const common_envs = [
    `DATABASE_URL=postgresql://postgres:${postgresPassword}@$(PROJECT_NAME)-${input.appServiceName}-db:5432/lago-db`,
    `REDIS_URL=redis://:${redisPassword}@$(PROJECT_NAME)-${input.appServiceName}-redis:6379`,
    `SECRET_KEY_BASE=${secretKeyBase}`,
    `RAILS_ENV=production`,
    `RAILS_LOG_TO_STDOUT=true`,
    `LAGO_RSA_PRIVATE_KEY=${input.rsaPrivateKey}`,
    `LAGO_SIDEKIQ_WEB=true`,
    `LAGO_ENCRYPTION_PRIMARY_KEY=${encryptionPrimaryKey}`,
    `LAGO_ENCRYPTION_DETERMINISTIC_KEY=${encryptionDeterministicKey}`,
    `LAGO_ENCRYPTION_KEY_DERIVATION_SALT=${encryptionDerivationSalt}`,
    `LAGO_USE_AWS_S3=false`,
    `LAGO_USE_GCS=false`,
    `LAGO_PDF_URL=http://$(PROJECT_NAME)_${input.appServiceName}-pdf:3000`,
    `LAGO_REDIS_CACHE_URL=redis://:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379`,
    `LAGO_DISABLE_SEGMENT=true`,
    `LAGO_DISABLE_SIGNUP=false`,
    `LAGO_DISABLE_PDF_GENERATION=false`,
    `LAGO_OAUTH_PROXY_URL=https://proxy.getlago.com`,
    `LAGO_API_URL=https://$(PROJECT_NAME)-${input.appServiceName}-api.$(EASYPANEL_HOST)`,
    `LAGO_FRONT_URL=https://$(PROJECT_NAME)-${input.appServiceName}-frontend.$(EASYPANEL_HOST)`,
  ];

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
      serviceName: `${input.appServiceName}-pdf`,
      source: {
        type: "image",
        image: input.pdfServiceImage,
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-migrate`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [...common_envs].join("\n"),
      deploy: {
        command: "./scripts/migrate.sh",
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-api`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [...common_envs].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      deploy: {
        command: "./scripts/start.api.sh",
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
      serviceName: `${input.appServiceName}-frontend`,
      source: {
        type: "image",
        image: input.frontendServiceImage,
      },
      env: [
        `API_URL=https://$(PROJECT_NAME)-${input.appServiceName}-api.$(EASYPANEL_HOST)`,
        `APP_ENV=production`,
        `LAGO_OAUTH_PROXY_URL=https://proxy.getlago.com`,
        `LAGO_DISABLE_PDF_GENERATION=false`,
        `LAGO_API_URL=https://$(PROJECT_NAME)-${input.appServiceName}-api.$(EASYPANEL_HOST)`,
        `LAGO_FRONT_URL=https://$(PROJECT_NAME)-${input.appServiceName}-frontend.$(EASYPANEL_HOST)`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
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
        image: input.appServiceImage,
      },
      env: [...common_envs].join("\n"),
      deploy: {
        command: "./scripts/start.worker.sh",
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
      serviceName: `${input.appServiceName}-clock`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [...common_envs].join("\n"),
      deploy: {
        command: "./scripts/start.clock.sh",
      },
    },
  });

  return { services };
}
