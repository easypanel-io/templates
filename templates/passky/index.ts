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
  const turnstileSiteKey = randomString();
  const turnstileSecretKey = randomString();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      mounts: [
        {
          type: "volume",
          name: "passky_data",
          mountPath: "/var/www/html/data",
        },
      ],
      env: [
        `SERVER_LOCATION=US`,
        `SERVER_CORES=1`,
        `ADMIN_USERNAME=${input.adminUsername}`,
        `ADMIN_PASSWORD=${input.adminPassword}`,
        `CF_TURNSTILE_SITE_KEY=${turnstileSiteKey}`,
        `CF_TURNSTILE_SECRET_KEY=${turnstileSecretKey}`,
        `DATABASE_ENGINE=mysql`,
        `DATABASE_FILE=passky`,
        `MYSQL_HOST=$(PROJECT_NAME)-${input.appServiceName}-db`,
        `MYSQL_PORT=3306`,
        `MYSQL_DATABASE=$(PROJECT_NAME)`,
        `MYSQL_USER=mysql`,
        `MYSQL_PASSWORD=${databasePassword}`,
        `MYSQL_SSL=false`,
        `MYSQL_SSL_CA=/etc/ssl/certs/ca-certificates.crt`,
        `MYSQL_CACHE_MODE=0`,
        `REDIS_HOST=$(PROJECT_NAME)-${input.appServiceName}-redis`,
        `REDIS_PORT=6379`,
        `REDIS_PASSWORD=${redisPassword}`,
        `MAIL_ENABLED=false`,
        `MAIL_HOST=`,
        `MAIL_PORT=465`,
        `MAIL_USERNAME=`,
        `MAIL_PASSWORD=`,
        `MAIL_USE_TLS=true`,
        `ACCOUNT_MAX=100`,
        `ACCOUNT_MAX_PASSWORDS=10000`,
        `ACCOUNT_PREMIUM=-1`,
        `YUBI_CLOUD=https://api.yubico.com/wsapi/2.0/verify`,
        `YUBI_ID=67857`,
        `LIMITER_ENABLED=true`,
        `LIMITER_GET_INFO=-1`,
        `LIMITER_GET_STATS=-1`,
        `LIMITER_GET_TOKEN=3`,
        `LIMITER_GET_PASSWORDS=2`,
        `LIMITER_SAVE_PASSWORD=2`,
        `LIMITER_EDIT_PASSWORD=2`,
        `LIMITER_DELETE_PASSWORD=2`,
        `LIMITER_DELETE_PASSWORDS=10`,
        `LIMITER_CREATE_ACCOUNT=10`,
        `LIMITER_DELETE_ACCOUNT=10`,
        `LIMITER_IMPORT_PASSWORDS=10`,
        `LIMITER_FORGOT_USERNAME=60`,
        `LIMITER_ENABLE_2FA=10`,
        `LIMITER_DISABLE_2FA=10`,
        `LIMITER_ADD_YUBIKEY=10`,
        `LIMITER_REMOVE_YUBIKEY=10`,
        `LIMITER_UPGRADE_ACCOUNT=10`,
        `LIMITER_GET_REPORT=-1`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
    },
  });

  services.push({
    type: "mysql",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
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
