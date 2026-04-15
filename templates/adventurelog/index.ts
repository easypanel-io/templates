import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const secretKey = randomPassword();
  const adminPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-backend`,
      env: [
        `PGHOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `POSTGRES_DB=$(PROJECT_NAME)`,
        `POSTGRES_USER=postgres`,
        `POSTGRES_PASSWORD=${databasePassword}`,
        `SECRET_KEY=${secretKey}`,
        `PUBLIC_URL=https://$(PROJECT_NAME)-${input.appServiceName}.$(EASYPANEL_HOST)`,
        `DJANGO_ADMIN_USERNAME=admin`,
        `DJANGO_ADMIN_PASSWORD=${adminPassword}`,
        `DJANGO_ADMIN_EMAIL=admin@example.com`,
        `PUBLIC_SERVER_URL=http://$(PROJECT_NAME)-${input.appServiceName}-backend:8000`,
        `CSRF_TRUSTED_ORIGINS=https://$(PROJECT_NAME)-${input.appServiceName}.$(EASYPANEL_HOST),https://$(PRIMARY_DOMAIN)`,
        `FRONTEND_URL=https://$(PROJECT_NAME)-${input.appServiceName}.$(EASYPANEL_HOST)`,
        `BACKEND_PORT=5000`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.backendServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "media",
          mountPath: "/code/media",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `PUBLIC_SERVER_URL=http://$(PROJECT_NAME)-${input.appServiceName}-backend:8000`,
        `ORIGIN=https://$(PRIMARY_DOMAIN)`,
        `CSRF_TRUSTED_ORIGINS=https://$(PRIMARY_DOMAIN)`,
        `BODY_SIZE_LIMIT=Infinity`,
        `FRONTEND_PORT=8080`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      image: "postgis/postgis:16-3.5",
      password: databasePassword,
    },
  });

  return { services };
}
