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
  const secretKeyBase = randomString(64);

  const commonEnv = [
    `POSTGRES_USER=postgres`,
    `POSTGRES_PASSWORD=${postgresPassword}`,
    `POSTGRES_DB=$(PROJECT_NAME)`,
    `SECRET_KEY_BASE=${secretKeyBase}`,
    `SELF_HOSTED=true`,
    `RAILS_FORCE_SSL=false`,
    `RAILS_ASSUME_SSL=false`,
    `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
    `DB_PORT=5432`,
    `REDIS_URL=redis://:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379/1`,
  ];

  if (input.openaiToken) {
    commonEnv.push(`OPENAI_ACCESS_TOKEN=${input.openaiToken}`);
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: commonEnv.join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "storage",
          mountPath: "/rails/storage",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-worker`,
      env: commonEnv.join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: "bundle exec sidekiq",
      },
      mounts: [
        {
          type: "volume",
          name: "storage",
          mountPath: "/rails/storage",
        },
      ],
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

  return { services };
}
