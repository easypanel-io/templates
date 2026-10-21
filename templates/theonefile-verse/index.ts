import { randomBytes } from "crypto";
import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const redisServiceName = `${input.appServiceName}-redis`;
  const redisPassword = randomPassword();
  const encryptionKey = randomBytes(32).toString("hex");

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
          port: 10101,
        },
      ],
      env: [
        `PORT=10101`,
        `DATA_DIR=/app/data`,
        `UPDATE_INTERVAL=24`,
        `REDIS_URL=redis://default:${redisPassword}@$(PROJECT_NAME)_${redisServiceName}:6379`,
        `ENCRYPTION_KEY=${encryptionKey}`,
        `REQUIRE_WS_TOKEN=${input.requireWsToken ? "true" : "false"}`,
        `CORS_ORIGIN=https://$(PRIMARY_DOMAIN)`,
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
    type: "redis",
    data: {
      serviceName: redisServiceName,
      password: redisPassword,
      command:
        "redis-server --maxmemory 200mb --maxmemory-policy volatile-lru --appendonly yes",
    },
  });

  return { services };
}
