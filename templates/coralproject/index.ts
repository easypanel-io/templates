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

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `MONGODB_URI=mongodb://mongo:${mongoPassword}@$(PROJECT_NAME)_${input.databaseServiceName}:27017`,
        `REDIS_URI=redis://default:${redisPassword}@$(PROJECT_NAME)_${input.redisServiceName}:6379`,
        `SIGNING_SECRET=${btoa(randomString(45))}`,
        `NODE_ENV=production`,
      ].join("\n"),
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
      ports: input.enableMetricsPort
        ? [{ protocol: "tcp", published: 9000, target: 9000 }]
        : [],
    },
  });

  services.push({
    type: "redis",
    data: { serviceName: input.redisServiceName, password: redisPassword },
  });

  services.push({
    type: "mongo",
    data: { serviceName: input.databaseServiceName, password: mongoPassword },
  });

  return { services };
}
