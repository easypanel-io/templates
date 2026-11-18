import { randomBytes } from "crypto";
import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const redisPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `CACHE__REDIS_URI=redis://default:${redisPassword}@$(PROJECT_NAME)_${input.redisServiceName}:6379`,
        `PUBLIC_URL=https://$(PRIMARY_DOMAIN)`,
        `AUTH_TOKEN_SECRET=${randomBytes(32).toString("base64")}`,
        `SESSION_SECRET=${randomBytes(32).toString("base64")}`,
      ].join("\n"),
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
    data: { serviceName: input.redisServiceName, password: redisPassword },
  });

  return { services };
}
