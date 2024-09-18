import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const encryptionKey = randomString(32);
  const jwtKey = randomString(64);
  const redisPassword = randomPassword();
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `AP_ENVIRONMENT=prod`,
        `AP_ENCRYPTION_KEY=${encryptionKey}`,
        `AP_JWT_SECRET=${jwtKey}`,
        `AP_FRONTEND_URL=https://$(PRIMARY_DOMAIN)`,
        `AP_POSTGRES_DATABASE=$(PROJECT_NAME)`,
        `AP_POSTGRES_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `AP_POSTGRES_PORT=5432`,
        // TODO: When privileged support becomes available, switch this to a sandboxed mode.
        `AP_EXECUTION_MODE=UNSANDBOXED`,
        `AP_POSTGRES_USERNAME=postgres`,
        `AP_POSTGRES_PASSWORD=${databasePassword}`,
        `AP_SANDBOX_RUN_TIME_SECONDS=600`,
        `AP_TELEMENTRY=false`,
        `AP_REDIS_URL=redis://default:${redisPassword}@$(PROJECT_NAME)_${input.redisServiceName}:6379`,
        `AP_SIGN_UP_ENABLED=false`,
        `AP_NODE_EXECUTABLE_PATH=/usr/local/bin/node`,
        `AP_ENGINE_EXECUTABLE_PATH=dist/packages/engine/main.js`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
    },
  });

  services.push({
    type: "redis",
    data: { serviceName: input.redisServiceName, password: redisPassword },
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
