import { Output, randomPassword, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const appEnv = [
    `APP_NAME=2FAuth`,
    `APP_ENV=production`,
    `APP_DEBUG=false`,
    `IS_DEMO_APP=false`,
    `SITE_OWNER=${input.appOwnerMail}`,
    `APP_KEY=${randomString(32)}`,
    `APP_URL=https://$(PRIMARY_DOMAIN)`,
    `LOG_CHANNEL=daily`,
    `LOG_LEVEL=notice`,
    `THROTTLE_API=60`,
    `LOGIN_THROTTLE=5`,
    `AUTHENTICATION_GUARD=web-guard`,
    `WEBAUTHN_NAME=2FAuth`,
    `WEBAUTHN_USER_VERIFICATION=preferred`,
    `BROADCAST_DRIVER=log`,
    `QUEUE_DRIVER=sync`,
    `SESSION_LIFETIME=120`,
  ];

  if (input.databaseType === "sqlite") {
    appEnv.push(
      `DB_CONNECTION=sqlite`,
      `DB_DATABASE="/srv/database/database.sqlite"`,
    );
  }else {
    const databasePassword = randomPassword();
    services.push({
      type: input.databaseType,
      data: {
        projectName: input.projectName,
        serviceName: input.databaseServiceName,
        password: databasePassword,
      },
    });
    if (input.databaseType === "postgres"){
      appEnv.push(
        `DB_CONNECTION=pgsql`,
        `DB_PORT=5432`,
        `DB_DATABASE=$(PROJECT_NAME)`,
        `DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `DB_USERNAME=${input.databaseType}`,
        `DB_PASSWORD=${databasePassword}`,
      );
    }else {
      appEnv.push(
        `DB_CONNECTION=mysql`,
        `DB_PORT=3306`,
        `DB_DATABASE=$(PROJECT_NAME)`,
        `DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `DB_USERNAME=${input.databaseType}`,
        `DB_PASSWORD=${databasePassword}`,
      );
    }
  }

  if (input.redis) {
    const redisPassword = randomPassword();
    services.push({
      type: "redis",
      data: {
        projectName: input.projectName,
        serviceName: input.redisServiceName,
        password: redisPassword,
      },
    });
    appEnv.push(
      `REDIS_HOST=$(PROJECT_NAME)_${input.redisServiceName}`,
      `REDIS_PASSWORD=${redisPassword}`,
      `REDIS_PORT=6379`,
      );
  }

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: appEnv.join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "stacks",
          mountPath: "/2fauth",
        },
      ],
    },
  });

  return { services };
}
