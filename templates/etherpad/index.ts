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
        `DB_TYPE=postgres`,
        `DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `DB_NAME=$(PROJECT_NAME)`,
        `DB_PORT=5432`,
        `DB_USER=postgres`,
        `DB_PASS=${databasePassword}`,
        `ETHERPAD_PORT=9001`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 9001,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "base",
          mountPath: "/opt",
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
