import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mongoPassword = randomPassword();
  const redisPassword = randomPassword();
  const authSecret = randomString(32);
  const kekVersion1 = randomString(32);

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

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-app`,
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
      env: [
        `MONGODB_URI=mongodb://mongo:${mongoPassword}@$(PROJECT_NAME)_${input.appServiceName}-db:27017/?tls=false`,
        `REDIS_URI=redis://default:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379`,
        `KEK_VERSION=KEK_VERSION_1`,
        `KEK_VERSION_1=${kekVersion1}`,
        `AUTH_SECRET=${authSecret}`,
        `AUTH_TRUST_HOST=true`,
        `AUTH_URL=https://$(PRIMARY_DOMAIN)`,
        `PROXY_DOMAIN=$(PROJECT_NAME)-${input.appServiceName}-proxy.$(EASYPANEL_HOST)`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-proxy`,
      source: {
        type: "image",
        image: input.proxyServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      env: [
        `MONGODB_URI=mongodb://mongo:${mongoPassword}@$(PROJECT_NAME)_${input.appServiceName}-db:27017/?tls=false`,
        `REDIS_URI=redis://default:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379`,
        `KEK_VERSION_1=${kekVersion1}`,
        `APP_DOMAIN=$(PROJECT_NAME)-${input.appServiceName}-app.$(EASYPANEL_HOST)`,
      ].join("\n"),
    },
  });

  return { services };
}
