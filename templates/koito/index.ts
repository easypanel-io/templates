import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

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
          port: 4110,
        },
      ],
      env: [
        `KOITO_DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
        `KOITO_ALLOWED_HOSTS=$(PRIMARY_DOMAIN)`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/etc/koito",
        },
      ],
    },
  });

  return { services };
}
