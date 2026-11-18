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
        `FLOWISE_USERNAME=${input.username}`,
        `FLOWISE_PASSWORD=${input.password}`,
        `DATABASE_TYPE=postgres`,
        `DATABASE_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `DATABASE_PORT=5432`,
        `DATABASE_USER=postgres`,
        `DATABASE_PASSWORD=${databasePassword}`,
        `DATABASE_NAME=$(PROJECT_NAME)`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/root/.flowise",
        },
      ],
      deploy: {
        command: "sleep 3; flowise start",
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
