import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mongodbPassword = randomPassword();
  const redisPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `MONGO_INITDB_ROOT_USERNAME=mongo`,
        `MONGO_INITDB_ROOT_PASSWORD=${mongodbPassword}`,
        `MONGO_URL=mongodb://mongo:${mongodbPassword}@$(PROJECT_NAME)-${input.databaseServiceName}:27017/$(PROJECT_NAME)?authSource=admin`,
        `REDIS_URL=redis://:${redisPassword}@$(PROJECT_NAME)-${input.redisServiceName}:6379`,
        `COUNTLY_DBNAME=$(PROJECT_NAME)`,
        `COUNTLY_SSL_ENABLED=false`,
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
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/usr/share/countly",
        },
      ],
    },
  });

  services.push({
    type: "mongo",
    data: {
      serviceName: input.databaseServiceName,
      image: "mongo:6",
      password: mongodbPassword,
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: input.redisServiceName,
      image: "redis:7",
      password: redisPassword,
    },
  });

  return { services };
}
