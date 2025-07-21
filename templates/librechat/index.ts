import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const postgresPassword = randomPassword();
  const meiliMasterKey = randomPassword();
  const jwtSecret = randomPassword();
  const jwtRefreshSecret = randomPassword();
  const credsKey = randomPassword();
  const credsIv = randomPassword();
  const mongoPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.librechatImage,
      },
      env: [
        `HOST=0.0.0.0`,
        `PORT=3080`,
        `MONGO_URI=mongodb://mongo:${mongoPassword}@$(PROJECT_NAME)_${input.appServiceName}-mongo:27017/?tls=false`,
        `MEILI_HOST=http://$(PROJECT_NAME)_${input.appServiceName}-meilisearch:7700`,
        `RAG_PORT=8000`,
        `RAG_API_URL=http://$(PROJECT_NAME)_${input.appServiceName}-rag-api:8000`,
        `DOMAIN_CLIENT=https://$(PRIMARY_DOMAIN)`,
        `DOMAIN_SERVER=https://$(PRIMARY_DOMAIN)`,
        `NO_INDEX=true`,
        `TRUST_PROXY=1`,
        `CONSOLE_JSON=false`,
        `DEBUG_LOGGING=true`,
        `DEBUG_CONSOLE=false`,
        `SEARCH=true`,
        `MEILI_NO_ANALYTICS=true`,
        `MEILI_MASTER_KEY=${meiliMasterKey}`,
        `ALLOW_EMAIL_LOGIN=${input.allowEmailLogin}`,
        `ALLOW_REGISTRATION=${input.allowRegistration}`,
        `ALLOW_SOCIAL_LOGIN=false`,
        `ALLOW_SOCIAL_REGISTRATION=false`,
        `ALLOW_PASSWORD_RESET=false`,
        `ALLOW_UNVERIFIED_EMAIL_LOGIN=true`,
        `SESSION_EXPIRY=1000 * 60 * 15`,
        `REFRESH_TOKEN_EXPIRY=(1000 * 60 * 60 * 24) * 7`,
        `JWT_SECRET=${jwtSecret}`,
        `JWT_REFRESH_SECRET=${jwtRefreshSecret}`,
        `APP_TITLE=${input.appTitle}`,
        `HELP_AND_FAQ_URL=https://librechat.ai`,
        `ALLOW_SHARED_LINKS=true`,
        `ALLOW_SHARED_LINKS_PUBLIC=true`,
        `CREDS_KEY=${credsKey}`,
        `CREDS_IV=${credsIv}`,
        `DEBUG_PLUGINS=true`,
        `BAN_VIOLATIONS=true`,
        `BAN_DURATION=1000 * 60 * 60 * 2`,
        `BAN_INTERVAL=20`,
        `LOGIN_VIOLATION_SCORE=1`,
        `REGISTRATION_VIOLATION_SCORE=1`,
        `CONCURRENT_VIOLATION_SCORE=1`,
        `MESSAGE_VIOLATION_SCORE=1`,
        `NON_BROWSER_VIOLATION_SCORE=20`,
        `LIMIT_CONCURRENT_MESSAGES=true`,
        `CONCURRENT_MESSAGE_MAX=2`,
        `LIMIT_MESSAGE_IP=true`,
        `MESSAGE_IP_MAX=40`,
        `MESSAGE_IP_WINDOW=1`,
        `LIMIT_MESSAGE_USER=false`,
        `MESSAGE_USER_MAX=40`,
        `MESSAGE_USER_WINDOW=1`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3080,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "librechat-images",
          mountPath: "/app/client/public/images",
        },
        {
          type: "volume",
          name: "librechat-uploads",
          mountPath: "/app/uploads",
        },
        {
          type: "volume",
          name: "librechat-logs",
          mountPath: "/app/api/logs",
        },
      ],
    },
  });

  services.push({
    type: "mongo",
    data: {
      serviceName: `${input.appServiceName}-mongo`,
      password: mongoPassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-meilisearch`,
      source: {
        type: "image",
        image: input.meilisearchImage,
      },
      env: [
        `MEILI_HOST=http://0.0.0.0:7700`,
        `MEILI_NO_ANALYTICS=true`,
        `MEILI_MASTER_KEY=${meiliMasterKey}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "meilisearch-data",
          mountPath: "/meili_data",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-vector-db`,
      password: postgresPassword,
      user: "librechat",
      databaseName: "librechat_vectors",
      image: input.vectorDbImage,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-rag-api`,
      source: {
        type: "image",
        image: input.ragApiImage,
      },
      env: [
        `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-vector-db`,
        `RAG_PORT=8000`,
        `POSTGRES_DB=librechat_vectors`,
        `POSTGRES_USER=librechat`,
        `POSTGRES_PASSWORD=${postgresPassword}`,
        `OPENAI_API_KEY=${input.openaiApiKey}`,
      ].join("\n"),
    },
  });

  return { services };
}
