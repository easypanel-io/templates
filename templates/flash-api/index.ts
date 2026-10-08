import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const dbPassword = randomPassword();
  const redisPassword = randomPassword();
  const globalApiKey = randomString(32);
  const webSocketSecret = randomString(32);
  const managerPassword = input.managerPassword?.trim()
    ? input.managerPassword.trim()
    : randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      env: [
        `HOST=0.0.0.0`,
        `PORT=3000`,
        `PROTOCOLO=http`,
        `NODE_ENV=production`,
        `LOG_LEVEL=info`,
        `BAILEYS_LOG_LEVEL=error`,
        `TZ=UTC`,
        `SYNC_SESSIONS=true`,
        `CORS_ORIGINS=*`,
        `MANAGER=true`,
        `LOGIN_MANAGER_ADMIN=admin`,
        `LOGIN_MANAGER_USER=user`,
        `SENHA_MANAGER_ADMIN=${managerPassword}`,
        `SESSION_PHONE_CLIENT=FlashApi`,
        `SESSION_PHONE_NAME=Chrome`,
        `GLOBAL_API_KEY=${globalApiKey}`,
        `ENABLE_GLOBAL_WEBHOOK=false`,
        `ENABLE_WEBSOCKET=true`,
        `GLOBAL_WEBSOCKET_SECRET=${webSocketSecret}`,
        `DB_TYPE=postgres`,
        `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `DB_PORT=5432`,
        `DB_USER=flashapi`,
        `DB_PASSWORD=${dbPassword}`,
        `DB_DATABASE=$(PROJECT_NAME)`,
        `DB_CONNECTION_LIMIT=10`,
        `QUEUELIMIT=0`,
        `LIMITE_QRCODE=10`,
        `DELETE_SESAO_DISCONECT=true`,
        `TEMP_DELETE_SESSAO=5`,
        `PROXY_STATE=false`,
        `REDIS_HOST=$(PROJECT_NAME)-${input.appServiceName}-redis`,
        `REDIS_PORT=6379`,
        `REDIS_PASS=${redisPassword}`,
      ].join("\n"),
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 3000 }],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      user: "flashapi",
      password: dbPassword,
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
