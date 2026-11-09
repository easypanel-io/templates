import { Output, randomPassword, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const nextAuthSecret = randomString(32);
  const cronSecret = randomString(16);

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  const appEnv = [
    `DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
    `NEXTAUTH_URL=https://$(PRIMARY_DOMAIN)`,
    `NEXT_PUBLIC_APP_URL=https://$(PRIMARY_DOMAIN)`,
    `NEXTAUTH_SECRET=${nextAuthSecret}`,
    `CRON_SECRET=${cronSecret}`,
  ];

  if (input.resendApiKey) {
    appEnv.push(`RESEND_API_KEY=${input.resendApiKey}`);
  }

  if (input.smtpHost) {
    appEnv.push(`SMTP_HOST=${input.smtpHost}`);
    appEnv.push(`SMTP_PORT=${input.smtpPort || "587"}`);
    if (input.smtpUser) appEnv.push(`SMTP_USER=${input.smtpUser}`);
    if (input.smtpPass) appEnv.push(`SMTP_PASS=${input.smtpPass}`);
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
      mounts: [
        {
          type: "volume",
          name: "photos",
          mountPath: "/app/data/photos",
        },
      ],
    },
  });

  const cronEndpoint = (path: string) =>
    `wget -q -O - --header=\\"Authorization: Bearer ${cronSecret}\\" http://$(PROJECT_NAME)_${input.appServiceName}:3000/api/cron/${path} > /proc/1/fd/1 2>&1`;

  const cronCommand = `sh -c "echo '0 8 * * * ${cronEndpoint("send-reminders")}' > /etc/crontabs/root && echo '0 3 * * * ${cronEndpoint("purge-deleted")}' >> /etc/crontabs/root && echo '0 2,10,18 * * * ${cronEndpoint("carddav-sync")}' >> /etc/crontabs/root && echo '*/5 * * * * ${cronEndpoint("geocode")}' >> /etc/crontabs/root && crond -f -l 2"`;

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-cron`,
      source: {
        type: "image",
        image: "alpine:3.24.4",
      },
      deploy: {
        command: cronCommand,
      },
      env: [`CRON_SECRET=${cronSecret}`].join("\n"),
    },
  });

  return { services };
}
