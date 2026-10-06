import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const crypto = require("crypto");
  const redisPassword = randomPassword();
  const initialPassword = randomPassword();
  const jwtSecret = crypto.randomBytes(48).toString("base64");
  const apiKeySecret = crypto.randomBytes(32).toString("hex");
  const wsBridgeSecret = crypto.randomBytes(32).toString("base64");
  const storageEncryptionKey = crypto.randomBytes(32).toString("hex");

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `DATA_DIR=/app/data`,
        `PORT=20128`,
        `DASHBOARD_PORT=20128`,
        `LIVE_WS_ALLOWED_ORIGINS=https://$(PRIMARY_DOMAIN)`,
        `REDIS_URL=redis://:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379`,
        `JWT_SECRET=${jwtSecret}`,
        `API_KEY_SECRET=${apiKeySecret}`,
        `OMNIROUTE_WS_BRIDGE_SECRET=${wsBridgeSecret}`,
        `STORAGE_ENCRYPTION_KEY=${storageEncryptionKey}`,
        `INITIAL_PASSWORD=${initialPassword}`,
        `AUTH_COOKIE_SECURE=true`,
        `REQUIRE_API_KEY=false`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 20128,
        },
      ],
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
      serviceName: `${input.appServiceName}-redis`,
      password: redisPassword,
    },
  });

  return { services };
}
