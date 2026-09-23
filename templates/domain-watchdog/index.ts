import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();
  const appSecret = randomString(32);
  const jwtPassphrase = randomString(32);

  const redisBase = `redis://default:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379`;

  const sharedEnv = [
    `APP_ENV=prod`,
    `APP_SECRET=${appSecret}`,
    `SERVER_NAME=:80`,
    `DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)?serverVersion=16&charset=utf8`,
    `MESSENGER_ASYNC_TRANSPORT_DSN=${redisBase}/messages`,
    `MESSENGER_RDAP_LOW_TRANSPORT_DSN=${redisBase}/messages-rdap-low`,
    `MESSENGER_RDAP_HIGH_TRANSPORT_DSN=${redisBase}/messages-rdap-high`,
    `LOCK_DSN=${redisBase}`,
    `HTTP_SECURE_COOKIE=true`,
    `JWT_PASSPHRASE=${jwtPassphrase}`,
    `REGISTRATION_ENABLED=true`,
    `REGISTRATION_VERIFY_EMAIL=false`,
  ];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: sharedEnv.join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "var",
          mountPath: "/app/var",
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
      env: sharedEnv.join("\n"),
      deploy: {
        command:
          "sleep 30 && exec php /app/bin/console messenger:consume --all --time-limit=3600",
      },
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
      image: "postgres:16.15-alpine",
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
