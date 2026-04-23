import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mongoPassword = randomPassword();
  const redisPassword = randomPassword();
  const jwtSecret = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `PORT=3000`,
        `NODE_ENV=production`,
        `JWT_SECRET=${jwtSecret}`,
        `MONGO_URI=mongodb://mongo:${mongoPassword}@$(PROJECT_NAME)_${input.appServiceName}-db:27017/wp-autoflow?authSource=admin`,
        `REDIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
        `REDIS_PORT=6379`,
        `REDIS_PASSWORD=${redisPassword}`,
        `OPENAI_API_KEY=${input.openaiApiKey}`,
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
      mounts: [
        {
          type: "volume",
          name: "storage",
          mountPath: "/app/storage",
        },
      ],
    },
  });

  services.push({
    type: "mongo",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: mongoPassword,
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