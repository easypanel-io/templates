import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const redisPassword = randomPassword();
  const mongoPassword = randomPassword();
  const jwtSecret = randomString(32);

  services.push({
    type: "redis",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      password: redisPassword,
    },
  });

  services.push({
    type: "mongo",
    data: {
      serviceName: `${input.appServiceName}-mongo`,
      image: input.mongoServiceImage,
      password: mongoPassword,
    },
  });

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
          port: 52345,
        },
      ],
      env: [
        `UPTIME_APP_API_BASE_URL=https://$(PRIMARY_DOMAIN)/api/v1`,
        `UPTIME_APP_CLIENT_HOST=https://$(PRIMARY_DOMAIN)`,
        `DB_CONNECTION_STRING=mongodb://mongo:${mongoPassword}@$(PROJECT_NAME)_${input.appServiceName}-mongo:27017/?tls=false`,
        `REDIS_URL=redis://default:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379`,
        `CLIENT_HOST=https://$(PRIMARY_DOMAIN)`,
        `JWT_SECRET=${jwtSecret}`,
      ].join("\n"),
    },
  });

  return { services };
}
