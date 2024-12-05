import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const appKey = Buffer.from(randomString(32)).toString("base64");
  const databasePassword = randomPassword();
  const jwtSecret = randomString(40);
  const sharedSecret = randomString(40);

  const apiEnvironment = [
    `APP_NAME=OpnForm`,
    `APP_ENV=production`,
    `APP_KEY=base64:${appKey}`,
    `APP_DEBUG=false`,
    `APP_URL=https://$(PRIMARY_DOMAIN)`,
    `DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
    `REDIS_HOST=$(PROJECT_NAME)_${input.redisServiceName}`,
    `DB_DATABASE=$(PROJECT_NAME)`,
    `DB_USERNAME=postgres`,
    `DB_PASSWORD=${databasePassword}`,
    `DB_CONNECTION=pgsql`,
    `FILESYSTEM_DISK=local`,
    `LOCAL_FILESYSTEM_VISIBILITY=public`,
    `JWT_SECRET=${jwtSecret}`,
    `FRONT_API_SECRET=${sharedSecret}`,
  ].join("\n");

  services.push({
    type: "app",
    data: {
      serviceName: input.apiServiceName,
      env: apiEnvironment,
      source: {
        type: "image",
        image: input.apiServiceImage,
      },
      mounts: [
        {
          type: "volume",
          name: "opnform-storage",
          mountPath: "/usr/share/nginx/html/storage",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.workerServiceName,
      env: apiEnvironment + "\nIS_API_WORKER=true",
      source: {
        type: "image",
        image: input.apiServiceImage,
      },
      mounts: [
        {
          type: "volume",
          name: "opnform-storage",
          mountPath: "/usr/share/nginx/html/storage",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.uiServiceName,
      env: [
        `NUXT_PUBLIC_APP_URL=/`,
        `NUXT_PUBLIC_API_BASE=/api`,
        `NUXT_API_SECRET=${sharedSecret}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.uiServiceImage,
      },
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: input.redisServiceName,
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.ingressServiceName,
      source: {
        type: "image",
        image: "nginx:1",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
    },
  });

  return { services };
}
