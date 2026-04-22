import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mysqlPassword = randomPassword();
  const mysqlRootPassword = randomPassword();
  const redisPassword = randomPassword();
  const secretKey = randomString(32);
  const bootstrapToken = randomString(32);

  services.push({
    type: "mysql",
    data: {
      serviceName: `${input.appServiceName}-mysql`,
      password: mysqlPassword,
      rootPassword: mysqlRootPassword,
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
      serviceName: input.appServiceName,
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
        `SECRET_KEY=${secretKey}`,
        `BOOTSTRAP_TOKEN=${bootstrapToken}`,
        "DB_ENGINE=mysql",
        `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-mysql`,
        `DB_PORT=3306`,
        `DB_USER=mysql`,
        `DB_PASSWORD=${mysqlPassword}`,
        `DB_NAME=$(PROJECT_NAME)`,
        `REDIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
        `REDIS_PORT=6379`,
        `REDIS_PASSWORD=${redisPassword}`,
        `SERVER_NAME=https://$(PRIMARY_DOMAIN)`,
        `CSRF_TRUSTED_ORIGINS=https://$(PRIMARY_DOMAIN)`,
        `DOMAINS=$(PRIMARY_DOMAIN)`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "jumpserver-data",
          mountPath: "/opt/jumpserver/data",
        },
      ],
    },
  });

  return { services };
}
