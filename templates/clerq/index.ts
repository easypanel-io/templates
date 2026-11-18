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
  const databaseUrl = `postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`;

  const env = [
    `DATABASE_URL=${databaseUrl}`,
    `BETTER_AUTH_SECRET=${authSecret}`,
    `BETTER_AUTH_URL=https://$(PRIMARY_DOMAIN)`,
  ];

  if (input.googleClientId && input.googleClientSecret) {
    env.push(`GOOGLE_CLIENT_ID=${input.googleClientId}`);
    env.push(`GOOGLE_CLIENT_SECRET=${input.googleClientSecret}`);
  }

  if (input.groqApiKey) {
    env.push(`GROQ_API_KEY=${input.groqApiKey}`);
  }

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
      env: env.join("\n"),
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
