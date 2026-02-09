import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const encryptionSecret = randomString(32);
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();

  const commonEnv = [
    `ENCRYPTION_SECRET=${encryptionSecret}`,
    `DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
    `NODE_OPTIONS=--no-node-snapshot`,
    `NEXTAUTH_URL=https://$(PROJECT_NAME)-${input.appServiceName}-builder.$(EASYPANEL_HOST)`,
    `NEXT_PUBLIC_VIEWER_URL=https://$(PROJECT_NAME)-${input.appServiceName}-viewer.$(EASYPANEL_HOST)`,
    `ADMIN_EMAIL=${input.adminEmail}`,
    `REDIS_URL=redis://default:${redisPassword}@$(PROJECT_NAME)-${input.appServiceName}-redis:6379`,
  ];

  if (
    input.githubClientId &&
    input.githubClientSecret &&
    input.githubClientId.trim() !== "" &&
    input.githubClientSecret.trim() !== ""
  ) {
    commonEnv.push(
      `GITHUB_CLIENT_ID=${input.githubClientId}`,
      `GITHUB_CLIENT_SECRET=${input.githubClientSecret}`
    );
  }

  if (
    input.googleAuthClientId &&
    input.googleAuthClientSecret &&
    input.googleAuthClientId.trim() !== "" &&
    input.googleAuthClientSecret.trim() !== ""
  ) {
    commonEnv.push(
      `GOOGLE_AUTH_CLIENT_ID=${input.googleAuthClientId}`,
      `GOOGLE_AUTH_CLIENT_SECRET=${input.googleAuthClientSecret}`
    );
  }

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      password: redisPassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-builder`,
      source: { type: "image", image: input.builderServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 3000 }],
      env: [...commonEnv].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-viewer`,
      source: { type: "image", image: input.viewerServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 3000 }],
      env: [...commonEnv].join("\n"),
    },
  });

  return { services };
}
