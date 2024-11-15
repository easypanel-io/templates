import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3030,
        },
      ],
      env: [
        `LOGIN_ORIGIN=https://$(PRIMARY_DOMAIN)`,
        `APP_ORIGIN=https://$(PRIMARY_DOMAIN)`,
        `PORT=3030`,
        `REMIX_APP_PORT=3030`,
        `MAGIC_LINK_SECRET=secret`,
        `SESSION_SECRET=secret`,
        `ENCRYPTION_KEY=ae13021afef0819c3a307ad487071c06`,
        `POSTGRES_USER=postgres`,
        `POSTGRES_PASSWORD=${databasePassword}`,
        `POSTGRES_DB=$(PROJECT_NAME)`,
        `DATABASE_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`,
        `DIRECT_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`,
        `NODE_ENV=development`,
        `RUNTIME_PLATFORM=docker-compose`,

        `AUTH_GITHUB_CLIENT_ID=`,
        `AUTH_GITHUB_CLIENT_SECRET=`,
        `FROM_EMAIL=`,
        `REPLY_TO_EMAIL=`,
        `RESEND_API_KEY=`,
      ].join("\n"),
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
