import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secretkey = randomString(32);
  const randomPasswordRedis = randomPassword();
  const randomPasswordPostgres = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `SECRET_KEY_BASE=${secretkey}`,
        `FRONTEND_URL=https://${input.domain}`,
        `DEFAULT_LOCALE=${input.defaultLocale}`,
        `FORCE_SSL=true`,
        `ENABLE_ACCOUNT_SIGNUP=true`,
        `REDIS_URL=redis://default@${input.projectName}_${input.redisServiceName}:6379`,
        `REDIS_PASSWORD=${randomPasswordRedis}`,
        `REDIS_OPENSSL_VERIFY_MODE=none`,
        `POSTGRES_DATABASE=${input.projectName}`,
        `POSTGRES_HOST=${input.projectName}_${input.databaseServiceName}`,
        `POSTGRES_USERNAME=postgres`,
        `POSTGRES_PASSWORD=${randomPasswordPostgres}`,
        `RAILS_MAX_THREADS=5`,
        `NODE_ENV=production`,
        `RAILS_ENV=production`,
        `INSTALLATION_ENV=docker`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 3000,
        secure: true,
      },
      deploy: {
        command:
          "bundle exec rails db:chatwoot_prepare && bundle exec rails s -p 3000 -b 0.0.0.0",
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data/storage",
        },
        {
          type: "volume",
          name: "app",
          mountPath: "/app/storage",
        },
      ],
      domains: [
        {
          name: input.domain,
        },
      ],
    },
  });

  services.push({
    type: "redis",
    data: {
      projectName: input.projectName,
      serviceName: input.redisServiceName,
      password: randomPasswordRedis,
    },
  });

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      image: "postgres:12",
      password: randomPasswordPostgres,
    },
  });

  return { services };
}
