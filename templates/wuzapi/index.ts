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
  const rabbitmqPassword = randomPassword();
  const adminToken = randomString(32);
  const encryptionKey = randomString(32);
  const hmacKey = randomString(32);

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
          port: 8080,
        },
      ],
      env: [
        `WUZAPI_ADMIN_TOKEN=${adminToken}`,
        `WUZAPI_GLOBAL_ENCRYPTION_KEY=${encryptionKey}`,
        `WUZAPI_GLOBAL_HMAC_KEY=${hmacKey}`,
        `WUZAPI_GLOBAL_WEBHOOK=`,
        `DB_USER=postgres`,
        `DB_PASSWORD=${databasePassword}`,
        `DB_NAME=$(PROJECT_NAME)`,
        `DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `DB_PORT=5432`,
        `DB_SSLMODE=disable`,
        `TZ=America/Sao_Paulo`,
        `WEBHOOK_FORMAT=json`,
        `SESSION_DEVICE_NAME=WuzAPI`,
        `RABBITMQ_URL=amqp://wuzapi:${rabbitmqPassword}@$(PROJECT_NAME)_${input.rabbitmqServiceName}:5672/`,
        `RABBITMQ_QUEUE=whatsapp_events`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/app/data",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.rabbitmqServiceName,
      source: {
        type: "image",
        image: input.rabbitmqServiceImage ?? "rabbitmq:3-management-alpine",
      },
      env: [
        `RABBITMQ_DEFAULT_USER=wuzapi`,
        `RABBITMQ_DEFAULT_PASS=${rabbitmqPassword}`,
        `RABBITMQ_DEFAULT_VHOST=/`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "rabbitmq-data",
          mountPath: "/var/lib/rabbitmq",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
