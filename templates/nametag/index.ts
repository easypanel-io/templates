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
  const redisPassword = randomPassword();
  const nextAuthSecret = randomString(32);
  const cronSecret = randomString(16);

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

  const appEnv = [
    `DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
    `NEXTAUTH_URL=https://$(PRIMARY_DOMAIN)`,
    `NEXT_PUBLIC_APP_URL=https://$(PRIMARY_DOMAIN)`,
    `NEXTAUTH_SECRET=${nextAuthSecret}`,
    `CRON_SECRET=${cronSecret}`,
    `REDIS_URL=redis://:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379`,
    `REDIS_PASSWORD=${redisPassword}`,
  ];

  if (input.resendApiKey) {
    appEnv.push(`RESEND_API_KEY=${input.resendApiKey}`);
  }

  if (input.emailDomain) {
    appEnv.push(`EMAIL_DOMAIN=${input.emailDomain}`);
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
      env: appEnv.join("\n"),
    },
  });

  const cronCommand = `sh -c "echo '0 8 * * * wget -q -O - --header=\\"Authorization: Bearer ${cronSecret}\\" http://$(PROJECT_NAME)_${input.appServiceName}:3000/api/cron/send-reminders > /proc/1/fd/1 2>&1' > /etc/crontabs/root && crond -f -l 2"`;

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-cron`,
      source: {
        type: "image",
        image: "alpine:3.19",
      },
      deploy: {
        command: cronCommand,
      },
      env: [`CRON_SECRET=${cronSecret}`].join("\n"),
    },
  });

  return { services };
}
