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
    `CALENDSO_ENCRYPTION_KEY=${btoa(randomString(24))}`,
    `NEXT_PUBLIC_WEBAPP_URL=https://$(PRIMARY_DOMAIN)`,
    `#EMAIL_SERVER_HOST=smtp.example.org`,
    `#EMAIL_SERVER_PORT=25`,
    `#EMAIL_SERVER_USER=`,
    `#EMAIL_SERVER_PASSWORD=`,
    `#EMAIL_FROM=no-reply@example.org`,
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
