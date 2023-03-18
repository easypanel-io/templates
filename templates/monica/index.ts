import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      proxy: { port: 80, secure: true },
      domains: input.monicaAppUrl ? [{ name: input.monicaAppUrl }] : [],
      env: [
        `APP_ENV=production`,
        `APP_DEBUG=false`,
        `APP_KEY=base64:${btoa(randomString(32))}`,
        `HASH_SALT=${randomString(20)}`,
        `HASH_LENGTH=18`,
        `APP_URL=https://${input.monicaAppUrl || "localhost"}`,
        `APP_FORCE_URL=${input.monicaAppForceUrl}`,
        `DB_CONNECTION=mysql`,
        `DB_HOST=${input.projectName}_${input.databaseServiceName}`,
        `DB_DATABASE=${input.projectName}`,
        `DB_USERNAME=${input.databaseType}`,
        `DB_PASSWORD=${databasePassword}`,
        `DB_PREFIX=${input.databasePrefix || ""}`,
        `DB_USE_UTF8MB4=${input.databaseUseUtf8mb4}`,
        `CACHE_DRIVER=redis`,
        `REDIS_HOST=${input.projectName}_${input.redisServiceName}`,
        `REDIS_PASSWORD=${redisPassword}`,
        `APP_DISABLE_SIGNUP=${input.monicaAppDisableSignup}`,
        `CHECK_VERSION=${input.monicaCheckVersion}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "storage",
          mountPath: "/var/www/html/storage",
        },
        {
          type: "volume",
          name: "app",
          mountPath: "/var/www/html/app",
        },
        {
          type: "volume",
          name: "database",
          mountPath: "/var/www/html/database",
        },
        {
          type: "volume",
          name: "resources",
          mountPath: "/var/www/html/resources",
        },
        {
          type: "volume",
          name: "routes",
          mountPath: "/var/www/html/routes",
        },
      ],
    },
  });

  services.push({
    type: input.databaseType,
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  services.push({
    type: "redis",
    data: {
      projectName: input.projectName,
      serviceName: input.redisServiceName,
      password: redisPassword,
    },
  });

  return { services };
}
