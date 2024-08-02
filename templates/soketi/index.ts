import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const redisRandomPassword = randomPassword();
  const defaultAppKey = input.defaultAppKey || `pk_${randomString(12)}`;
  const defaultAppSecret = input.defaultAppSecret || `ps_${randomString(12)}`;

  const serviceVariables = [
    `SOKETI_DB_REDIS_HOST=$(PROJECT_NAME)_${input.redisServiceName}`,
    `SOKETI_DB_REDIS_PORT=6379`,
    `SOKETI_DB_REDIS_USERNAME=default`,
    `SOKETI_DB_REDIS_PASSWORD=${redisRandomPassword}`,
    `SOKETI_DEFAULT_APP_ID=${input.defaultAppId}`,
    `SOKETI_DEFAULT_APP_KEY=${defaultAppKey}`,
    `SOKETI_DEFAULT_APP_SECRET=${defaultAppSecret}`,
    `SOKETI_DEFAULT_APP_ENABLE_CLIENT_MESSAGES=${input.enableClientMessages}`,
  ];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: serviceVariables.join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 9601,
        },
      ],
      ports: [
        {
          published: 6001,
          target: 6001,
        },
      ],
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: input.redisServiceName,
      password: redisRandomPassword,
    },
  });

  return { services };
}
