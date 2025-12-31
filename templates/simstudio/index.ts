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
  const authSecret = randomString(32);
  const encryptionKey = randomString(32);

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
      image: "pgvector/pgvector:pg17",
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-migrations`,
      env: [
        `DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.migrationsServiceImage,
      },
      deploy: {
        command: "bun run db:migrate",
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
        `BETTER_AUTH_URL=https://$(PRIMARY_DOMAIN)`,
        `NEXT_PUBLIC_APP_URL=https://$(PRIMARY_DOMAIN)`,
        `BETTER_AUTH_SECRET=${authSecret}`,
        `ENCRYPTION_KEY=${encryptionKey}`,
        `FREESTYLE_API_KEY=${input.freestyleApiKey}`,
        `GOOGLE_CLIENT_ID=${input.googleClientId}`,
        `GOOGLE_CLIENT_SECRET=${input.googleClientSecret}`,
        `GITHUB_CLIENT_ID=${input.githubClientId}`,
        `GITHUB_CLIENT_SECRET=${input.githubClientSecret}`,
        `RESEND_API_KEY=${input.resendApiKey}`,
        `OLLAMA_URL=${input.ollamaUrl}`,
      ].join("\n"),
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
    },
  });

  return { services };
}
