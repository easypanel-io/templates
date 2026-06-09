import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const jwtKey = randomString(32);

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
          port: 3000,
        },
      ],
      env: [
        `NODE_ENV=development`,
        `HOST=0.0.0.0`,
        `PORT=3000`,
        `TRUST_PROXY=true`,
        `TZ=UTC`,

        `LOGS_DEBUG=true`,
        `LOGS_COLORS=true`,
        `LOGS_JSON=true`,
        `LOGS_JSON_PRETTY=true`,

        `CORS_ORIGIN=*`,
        `CORS_METHODS=["GET", "POST"]`,

        `IP_WHITELIST_ENABLED=false`,
        `IP_WHITELIST_ALLOWED=["127.0.0.1", "::1"]`,

        `OIDC_ENABLED=false`,
        `OIDC_ALLOW_ROOMS_CREATION_FOR_AUTH_USERS=true`,
        `OIDC_BASE_URL_DYNAMIC=false`,
        `OIDC_ISSUER_BASE_URL=https://accounts.google.com`,
        `OIDC_BASE_URL=$(PRIMARY_DOMAIN)`,
        `OIDC_CLIENT_ID=1234567890`,
        `OIDC_CLIENT_SECRET=1234567890`,
        `OIDC_AUTH_REQUIRED=false`,
        `OIDC_AUTH_LOGOUT=true`,
        `SESSION_SECRET=1234567890`,

        `ROOM_MAX_PARTICIPANTS=8`,

        `HOST_USER_AUTH=false`,
        `HOST_USERS=[{"username": "admin", "password": "admin"},{"username": "guest", "password": "guest"}]`,

        `JWT_KEY=${jwtKey}`,
        `JWT_EXP=1h`,

        `PRESENTERS=["Admin User"]`,

        `NGROK_ENABLED=false`,
        `NGROK_AUTH_TOKEN=1234567890`,

        `STUN_SERVER_ENABLED=true`,
        `TURN_SERVER_URL=turn:a.relay.metered.ca:443`,
        `TURN_SERVER_USERNAME=e8dd65b92c62d3e36cafb807`,
        `TURN_SERVER_CREDENTIAL=uWdWNmkhvyqTEswO`,

        `IP_LOOKUP_ENABLED=false`,

        `API_KEY_SECRET=1234567890`,
        `API_DISABLED=["token", "meetings"]`,

        `SURVEY_ENABLED=true`,
        `SURVEY_URL=https://www.questionpro.com/t/AUs7VZq00L`,

        `REDIRECT_ENABLED=false`,
        `REDIRECT_URL=https://p2p.mirotalk.com`,

        `SENTRY_ENABLED=false`,
        `SENTRY_LOG_LEVELS=error`,
        `SENTRY_DSN=https://1234567890@sentry.io/1234567890`,
        `SENTRY_TRACES_SAMPLE_RATE=0.5`,

        `SLACK_ENABLED=false`,
        `SLACK_SIGNING_SECRET=1234567890`,

        `MATTERMOST_ENABLED=false`,
        `MATTERMOST_SERVER_URL=https://yourmattermostserver.com`,
        `MATTERMOST_USERNAME=yourmattermostusername`,
        `MATTERMOST_PASSWORD=yourmattermostpassword`,
        `MATTERMOST_TOKEN=1234567890`,
        `MATTERMOST_ROOM_TOKEN_EXPIRE=15m`,

        `CHATGPT_ENABLED=false`,
        `CHATGPT_BASE_PATH=https://api.openai.com/v1/`,
        `CHATGPT_APIKEY=1234567890`,
        `CHATGPT_MODEL=gpt-3.5-turbo`,
        `CHATGPT_MAX_TOKENS=1000`,
        `CHATGPT_TEMPERATURE=0`,

        `EMAIL_ALERT=false`,
        `EMAIL_HOST=smtp.gmail.com`,
        `EMAIL_PORT=587`,
        `EMAIL_USERNAME=your_username`,
        `EMAIL_PASSWORD=your_password`,
        `EMAIL_FROM=p2p.mirotalk@gmail.com`,
        `EMAIL_SEND_TO=p2p.mirotalk@gmail.com`,

        `STATS_ENABLED=true`,
        `STATS_SCR=https://stats.mirotalk.com/script.js`,
      ].join("\n"),
    },
  });

  return { services };
}
