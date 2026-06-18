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
  const appEnv = [
    `DATABASE_DIRECT_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`,
    `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`,
    `NEXTAUTH_SECRET=${btoa(randomString(32))}`,
    `NEXTAUTH_URL=https://$(PRIMARY_DOMAIN)`,
    `CALENDSO_ENCRYPTION_KEY=${btoa(randomString(24))}`,
    `NEXT_PUBLIC_WEBAPP_URL=https://$(PRIMARY_DOMAIN)`,
    `EMAIL_FROM=${input.smtpFrom}`,
    `EMAIL_FROM_NAME=${input.smtpFromName}`,
    `EMAIL_SERVER_HOST=${input.smtpHost}`,
    `EMAIL_SERVER_PORT=${input.smtpPort}`,
    `EMAIL_SERVER_USER=${input.smtpUser}`,
    `EMAIL_SERVER_PASSWORD=${input.smtpPassword}`,
  ];

  if (input.enableStudio) {
    services.push({
      type: "app",
      data: {
        serviceName: input.appServiceName + "-studio",
        source: { type: "image", image: input.appServiceImage },
        domains: [
          {
            host: "$(EASYPANEL_DOMAIN)",
            port: 5555,
          },
        ],
        deploy: { command: "npx prisma studio" },
        env: [
          `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`,
        ].join("\n"),
      },
    });
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      env: appEnv.join("\n"),
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
