import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mongoDatabasePassword = randomPassword();
  const mysqlDatabasePassword = randomPassword();
  const mysqlDatabaseRootPassword = randomPassword();

  const jwtSecret = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-nginx`,
      env: [
        `DYNAMIC_SERVER=$(PROJECT_NAME)_${input.appServiceName}-server`,
        `DYNAMIC_PORT=3000`,
        `WEBAPP_SERVER=$(PROJECT_NAME)_${input.appServiceName}-webapp`,
        `WEBAPP_PORT=80`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.nginxServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-webapp`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-server`,
      env: [
        `MAIL_HOST=`,
        `MAIL_USERNAME=`,
        `MAIL_PASSWORD=`,
        `MAIL_PORT=`,
        `MAIL_SECURE=`,
        `MAIL_FROM_NAME=`,
        `MAIL_FROM_ADDRESS=`,
        `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-mariadb`,
        `DB_USER=mariadb`,
        `DB_PASSWORD=${mysqlDatabasePassword}`,
        `DB_CHARSET=utf8`,
        `DB_ROOT_PASSWORD=${mysqlDatabaseRootPassword}`,
        `SYSTEM_DB_NAME=$(PROJECT_NAME)`,
        `TENANT_DB_NAME_PERFIX=bigcapital_tenant_`,
        `BASE_URL=`,
        `JWT_SECRET=${jwtSecret}`,
        `MONGODB_DATABASE_URL=mongodb://mongo:${mongoDatabasePassword}@$(PROJECT_NAME)_${input.appServiceName}-mongo:27017/?tls=false`,
        `PUBLIC_PROXY_PORT=80`,
        `PUBLIC_PROXY_SSL_PORT=443`,
        `AGENDASH_AUTH_USER=agendash`,
        `AGENDASH_AUTH_PASSWORD=123123`,
        `SIGNUP_DISABLED=false`,
        `SIGNUP_ALLOWED_DOMAINS=`,
        `SIGNUP_ALLOWED_EMAILS=`,
        `SIGNUP_EMAIL_CONFIRMATION=false`,
        `API_RATE_LIMIT=120,60,600`,
        `GOTENBERG_URL=http://$(PROJECT_NAME)_${input.appServiceName}-gotenberg:3000`,
        `GOTENBERG_DOCS_URL=http://$(PROJECT_NAME)_${input.appServiceName}-server:3000/public/`,
        `EXCHANGE_RATE_SERVICE=open-exchange-rate`,
        `OPEN_EXCHANGE_RATE_APP_ID=`,
        `BANKING_CONNECT=`,
        `PLAID_ENV=sandbox`,
        `PLAID_CLIENT_ID=`,
        `PLAID_SECRET=`,
        `PLAID_LINK_WEBHOOK=`,
        `LEMONSQUEEZY_API_KEY=`,
        `LEMONSQUEEZY_STORE_ID=`,
        `LEMONSQUEEZY_WEBHOOK_SECRET=`,
        `HOSTED_ON_BIGCAPITAL_CLOUD=`,
        `NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=`,
        `NEW_RELIC_LOG=`,
        `NEW_RELIC_AI_MONITORING_ENABLED=`,
        `NEW_RELIC_CUSTOM_INSIGHTS_EVENTS_MAX_SAMPLES_STORED=`,
        `NEW_RELIC_SPAN_EVENTS_MAX_SAMPLES_STORED=`,
        `NEW_RELIC_LICENSE_KEY=`,
        `NEW_RELIC_APP_NAME=`,
        `S3_REGION=US`,
        `S3_ACCESS_KEY_ID=`,
        `S3_SECRET_ACCESS_KEY=`,
        `S3_ENDPOINT=`,
        `S3_BUCKET=`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.serverServiceImage,
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-migration`,
      env: [
        `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-mariadb`,
        `DB_USER=mariadb`,
        `DB_PASSWORD=${mysqlDatabasePassword}`,
        `DB_CHARSET=utf8`,
        `SYSTEM_DB_NAME=$(PROJECT_NAME)`,
        `TENANT_DB_NAME_PERFIX=bigcapital_tenant_`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.migrationServiceImage,
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-gotenberg`,
      source: {
        type: "image",
        image: input.gotenServiceImage,
      },
    },
  });

  services.push({
    type: "mariadb",
    data: {
      serviceName: `${input.appServiceName}-mariadb`,
      image: input.mysqlServiceImage,
      password: mysqlDatabasePassword,
      rootPassword: mysqlDatabaseRootPassword,
    },
  });

  services.push({
    type: "mongo",
    data: {
      serviceName: `${input.appServiceName}-mongo`,
      image: input.mongoServiceImage,
      password: mongoDatabasePassword,
    },
  });

  return { services };
}
