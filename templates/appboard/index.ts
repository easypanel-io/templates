import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const authSecret = randomPassword() + randomPassword();
  const adminPassword = randomPassword();

  const panelUrl = `https://$(PROJECT_NAME)-${input.appServiceName}.$(EASYPANEL_HOST)`;

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-backend`,
      env: [
        `NODE_ENV=production`,
        `PORT=6680`,
        `DB_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
        `BETTER_AUTH_SECRET=${authSecret}`,
        `BETTER_AUTH_URL=${panelUrl}`,
        `ALLOWED_ORIGINS=${panelUrl}`,
        `ENCRYPTION_KEY=`,
        `ADMIN_EMAIL=admin@example.com`,
        `ADMIN_PASSWORD=${adminPassword}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.backendServiceImage,
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/app/data",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `NODE_ENV=production`,
        `PORT=6600`,
        `HOSTNAME=0.0.0.0`,
        `BACKEND_URL=http://$(PROJECT_NAME)-${input.appServiceName}-backend:6680`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 6600,
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      image: "postgres:18-alpine",
      password: databasePassword,
    },
  });

  return { services };
}
