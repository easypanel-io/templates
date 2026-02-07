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

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:6543/$(PROJECT_NAME)?pgbouncer`,
        `DIRECT_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
        `SUPABASE_ANON_PUBLIC=${input.supabaseAnonPublic}`,
        `SUPABASE_SERVICE_ROLE=${input.supabaseServiceRole}`,
        `SUPABASE_URL=${input.supabaseUrl}`,
        `SESSION_SECRET=${randomString(32)}`,
        `SERVER_URL=https://$(PRIMARY_DOMAIN)`,
        `MAPTILER_TOKEN=${input.maptilerToken}`,
        `SMTP_HOST=${input.smtpHost}`,
        `SMTP_USER=${input.smtpUser}`,
        `SMTP_FROM=${input.smtpFrom}`,
        `SMTP_PWD=${input.smtpPassword}`,
        `INVITE_TOKEN_SECRET=${randomString(32)}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  return { services };
}
