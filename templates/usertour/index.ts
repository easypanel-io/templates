import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const dbPassword = randomPassword();
  const redisPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `DATABASE_URL=postgres://postgres:${dbPassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
        `NEST_SERVER_PORT=3000`,
        `EMAIL_HOST=`,
        `EMAIL_PORT=`,
        `EMAIL_USER=`,
        `EMAIL_PASS=`,
        `Redis_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
        `Redis_PORT=6379`,
        `Redis_PASS=${redisPassword}`,
        `APP_HOMEPAGE_URL=https://$(PRIMARY_DOMAIN)`,
        `AWS_S3_REGION=`,
        `AWS_S3_ENDPOINT=`,
        `AWS_S3_ACCESS_KEY_ID=`,
        `AWS_S3_SECRET_ACCESS_KEY=`,
        `AWS_S3_BUCKET=`,
        `AWS_S3_DOMAIN=`,
        `JWT_SECRET=test`,
        `JWT_EXPIRATION_TIME=1h`,
        `JWT_REFRESH_EXPIRATION_TIME=7d`,
        `EMAIL_AUTH_ENABLED=true`,
        `EMAIL_SENDER=Usertour <support@usertour.io>`,
        `GITHUB_AUTH_ENABLED=false`,
        `GITHUB_CLIENT_ID=`,
        `GITHUB_CLIENT_SECRET=`,
        `GITHUB_CALLBACK_URL=https://$(PRIMARY_DOMAIN)/api/auth/github/callback`,
        `GOOGLE_AUTH_ENABLED=false`,
        `GOOGLE_CLIENT_ID=`,
        `GOOGLE_CLIENT_SECRET=`,
        `GOOGLE_CALLBACK_URL=https://$(PRIMARY_DOMAIN)/api/auth/google/callback`,
        `LOGIN_REDIRECT_URL=https://$(PRIMARY_DOMAIN)/env/1/flows`,
        `NODE_ENV=production`,
        `API_URL=`,
        `USERTOUR_TOKEN=`,
        `POSTHOG_KEY=`,
        `POSTHOG_HOST=`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
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
