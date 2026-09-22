import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const databaseServiceName = `${input.appServiceName}-db`;
  const workerServiceName = `${input.appServiceName}-worker`;

  const databasePassword = randomPassword();
  const authSecret = randomString(32);

  const databaseUrl = `postgresql://vigil:${databasePassword}@$(PROJECT_NAME)_${databaseServiceName}:5432/vigil`;
  // $(PRIMARY_DOMAIN) only resolves for the service it's attached to, so the
  // worker (which has no domain of its own) needs the web service's
  // auto-generated domain spelled out explicitly instead.
  const webPublicUrl = `https://$(PROJECT_NAME)-${input.appServiceName}.$(EASYPANEL_HOST)`;

  const sharedEnv = [
    `DATABASE_URL=${databaseUrl}`,
    `BETTER_AUTH_SECRET=${authSecret}`,
    `RESEND_API_KEY=${input.resendApiKey || ""}`,
    `EMAIL_FROM=${input.emailFrom}`,
    `LOG_LEVEL=info`,
    `ALLOW_PRIVATE_MONITOR_TARGETS=${
      input.allowPrivateMonitorTargets ? "true" : "false"
    }`,
    `RDAP_BASE_URL=https://rdap.org`,
    `TWILIO_ACCOUNT_SID=${input.twilioAccountSid || ""}`,
    `TWILIO_AUTH_TOKEN=${input.twilioAuthToken || ""}`,
    `TWILIO_FROM_NUMBER=${input.twilioFromNumber || ""}`,
  ];

  services.push({
    type: "app",
    data: {
      serviceName: databaseServiceName,
      source: {
        type: "image",
        image: "postgres:18-alpine",
      },
      env: [
        `POSTGRES_USER=vigil`,
        `POSTGRES_PASSWORD=${databasePassword}`,
        `POSTGRES_DB=vigil`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/var/lib/postgresql",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: `ghcr.io/sikurdev/vigil-core-web:${input.vigilVersion}`,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      env: [
        ...sharedEnv,
        `APP_URL=https://$(PRIMARY_DOMAIN)`,
        `ANTHROPIC_API_KEY=${input.anthropicApiKey || ""}`,
        `DEMO_MODE=${input.demoMode ? "true" : "false"}`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: workerServiceName,
      source: {
        type: "image",
        image: `ghcr.io/sikurdev/vigil-core-worker:${input.vigilVersion}`,
      },
      deploy: {
        command:
          "cd /app && node_modules/.bin/drizzle-kit migrate && node_modules/.bin/tsx src/worker/index.ts",
        sysctls: {
          "net.ipv4.ping_group_range": "0 2147483647",
        },
      },
      env: [
        ...sharedEnv,
        `APP_URL=${webPublicUrl}`,
        `MONITOR_SCHEDULER_BATCH=5000`,
      ].join("\n"),
    },
  });

  return { services };
}
