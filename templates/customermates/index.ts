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
  const authSecret = randomString(64);
  const cronSecret = randomString(32);

  const databaseUrl = `postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `APP_MODE=self-hosted`,
        `NODE_ENV=production`,
        `DATABASE_URL=${databaseUrl}`,
        `WORKFLOW_TARGET_WORLD=@workflow/world-postgres`,
        `WORKFLOW_POSTGRES_URL=${databaseUrl}`,
        `BASE_URL=https://$(PRIMARY_DOMAIN)`,
        `BETTER_AUTH_SECRET=${authSecret}`,
        `CRON_SECRET=${cronSecret}`,
        `RESEND_API_KEY=${input.resendApiKey ?? ""}`,
        `RESEND_OPERATOR_EMAIL=${input.resendOperatorEmail ?? ""}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 4000,
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      image: "postgres:16.15-alpine",
      password: databasePassword,
    },
  });

  return { services };
}
