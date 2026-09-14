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
  const nextAuthSecret = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/postgres`,
        `NEXTAUTH_URL=https://$(PRIMARY_DOMAIN)`,
        `NEXTAUTH_SECRET=${nextAuthSecret}`,
        `NEXT_PUBLIC_APP_URL=https://$(PRIMARY_DOMAIN)`,
        `NEXT_PUBLIC_SITE_URL=https://$(PRIMARY_DOMAIN)`,
        `HOSTNAME=0.0.0.0`,
        `PORT=3000`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      deploy: {
        command:
          "npx --yes prisma@6.3.1 generate && npx --yes prisma@6.3.1 migrate deploy && node server.js",
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
