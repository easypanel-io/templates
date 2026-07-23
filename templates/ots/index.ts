import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const redisPassword = randomPassword();

  const redisServiceName = `${input.appServiceName}-redis`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `LISTEN=:3000`,
        `STORAGE_TYPE=redis`,
        `REDIS_URL=redis://default:${redisPassword}@$(PROJECT_NAME)_${redisServiceName}:6379/0`,
        `SECRET_EXPIRY=604800`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: redisServiceName,
      password: redisPassword,
    },
  });

  return { services };
}
