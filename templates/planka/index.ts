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
        `TRUST_PROXY=0`,
        `BASE_URL=https://$(PRIMARY_DOMAIN)`,
        `DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`,
        `SECRET_KEY=nosecretkey`,
        `DEFAULT_ADMIN_EMAIL=${input.adminEmail}`,
        `DEFAULT_ADMIN_USERNAME=${input.adminUser}`,
        `DEFAULT_ADMIN_PASSWORD=${input.adminPassword}`,
        `DEFAULT_ADMIN_NAME=${input.adminName}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 1337,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "planka_config",
          mountPath: "/config",
        },
      ],
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
