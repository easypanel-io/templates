import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const databasePassword = randomPassword();
  const authSecret = randomPassword();
  const subscriptionJwtSecret = randomPassword();
  const databaseHost = `$(PROJECT_NAME)_${input.appServiceName}-db`;
  const appHost = `$(PROJECT_NAME)_${input.appServiceName}`;

  const env = [
    `SITE_URL=https://$(PRIMARY_DOMAIN)`,
    `DATABASE_URL=postgresql://postgres:${databasePassword}@${databaseHost}:5432/$(PROJECT_NAME)?schema=public`,
    `AUTH_SECRET=${authSecret}`,
    `SUBSCRIPTION_JWT_SECRET=${subscriptionJwtSecret}`,
    `EMAIL_SERVER_HOST=${input.emailServerHost}`,
    `EMAIL_SERVER_PORT=${input.emailServerPort}`,
    input.emailServerUser && `EMAIL_SERVER_USER=${input.emailServerUser}`,
    input.emailServerPassword &&
      `EMAIL_SERVER_PASSWORD=${input.emailServerPassword}`,
    `EMAIL_FROM=${input.emailFrom}`,
    input.emailContact && `EMAIL_CONTACT_EMAIL=${input.emailContact}`,
    `DISABLE_USER_REGISTRATION=${input.disableUserRegistration}`,
    input.githubId && `GITHUB_ID=${input.githubId}`,
    input.githubSecret && `GITHUB_SECRET=${input.githubSecret}`,
    input.googleId && `GOOGLE_ID=${input.googleId}`,
    input.googleSecret && `GOOGLE_SECRET=${input.googleSecret}`,
    input.vapidPublicKey &&
      `NEXT_PUBLIC_VAPID_PUBLIC_KEY=${input.vapidPublicKey}`,
    input.vapidPrivateKey && `VAPID_PRIVATE_KEY=${input.vapidPrivateKey}`,
  ]
    .filter(Boolean)
    .join("\n");

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env,
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-cron`,
      source: {
        type: "image",
        image: "alpine:3.22",
      },
      deploy: {
        command: `sh -c 'while true; do /usr/bin/flock -n /tmp/wapy.lockfile wget -qO- ${appHost}:3000/api/cron/; sleep 60; done'`,
      },
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
