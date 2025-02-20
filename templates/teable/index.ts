import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `TIMEZONE=UTC`,

        `PUBLIC_ORIGIN=https://$(PRIMARY_DOMAIN)`,
        `PRISMA_DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
        `PUBLIC_DATABASE_PROXY=127.0.0.1:42345`,
        `# Need to support sending emails to enable the following configurations`,
        `# You need to modify the configuration according to the actual situation, otherwise it will not be able to send emails correctly.`,
        `#BACKEND_MAIL_HOST=smtp.teable.io`,
        `#BACKEND_MAIL_PORT=465`,
        `#BACKEND_MAIL_SECURE=true`,
        `#BACKEND_MAIL_SENDER=noreply.teable.io`,
        `#BACKEND_MAIL_SENDER_NAME=Teable`,
        `#BACKEND_MAIL_AUTH_USER=username`,
      ].join("\n"),
      source: {
        type: "image",
        image: `${input.appServiceImage}${input.enableArm ? "-arm64" : ""}`,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "app",
          mountPath: "/app/.assets",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-migration`,
      env: [
        `TIMEZONE=UTC`,
        `PRISMA_DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
      ].join("\n"),
      source: {
        type: "image",
        image: `${input.migrationServiceImage}${
          input.enableArm ? "-arm64" : ""
        }`,
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
