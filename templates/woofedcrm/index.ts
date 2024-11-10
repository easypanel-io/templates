import { randomBytes } from "crypto";
import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  // Hardcoding database and Redis service names
  const redisServiceName = `${input.appServiceName}-redis`;

  const redisPassword = randomPassword();

  // Generate random values for VAPID keys
  const vapidPublicKey = randomBytes(32).toString("base64");
  const vapidPrivateKey = randomBytes(32).toString("base64");

  // Redis service
  services.push({
    type: "redis",
    data: {
      serviceName: redisServiceName,
      password: redisPassword,
    },
  });

  // Environment variables for the app
  const appEnv = [
    `ENABLE_USER_SIGNUP=true`,
    `RAILS_ENV=production`,
    `RACK_ENV=production`,
    `NODE_ENV=production`,
    `MOTOR_AUTH_USERNAME=${input.appAdminUsername}`,
    `MOTOR_AUTH_PASSWORD=${input.appAdminPassword}`,
    `FRONTEND_URL=https://$(PRIMARY_DOMAIN)`,
    `REDIS_URL=redis://:${redisPassword}@$(PROJECT_NAME)_${redisServiceName}:6379/0`,
    `ACTIVE_STORAGE_SERVICE=local`,
    `RAILS_LOG_LEVEL=debug`,
    `DEFAULT_TIMEZONE=${input.appDefaultTimeZone}`,
    `VAPID_PUBLIC_KEY=${vapidPublicKey}`,
    `VAPID_PRIVATE_KEY=${vapidPrivateKey}`,
    `EVOLUTION_API_ENDPOINT=`,
    `EVOLUTION_API_ENDPOINT_TOKEN=`,
    `OPENAI_API_KEY=`,
  ];

  // Main app service
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
          port: 3000,
        },
      ],
      env: appEnv.join("\n"),
      mounts: [
        {
          type: "volume",
          name: "woofedcrm_data",
          mountPath: "/app",
        },
      ],
    },
  });

  // Sidekiq service
  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-sidekiq`,
      source: {
        type: "image",
        image: "douglara/woofedcrm:easy-install-latest",
      },
      deploy: {
        command: "bundle exec sidekiq -C config/sidekiq.yml",
      },
      env: appEnv.join("\n"),
      mounts: [
        {
          type: "volume",
          name: "woofedcrm_data",
          mountPath: "/app",
        },
      ],
    },
  });

  // Good Job service
  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-goodjob`,
      source: {
        type: "image",
        image: "douglara/woofedcrm:easy-install-latest",
      },
      deploy: {
        command: "bundle exec good_job",
      },
      env: appEnv.join("\n"),
      mounts: [
        {
          type: "volume",
          name: "woofedcrm_data",
          mountPath: "/app",
        },
      ],
    },
  });

  return { services };
}
