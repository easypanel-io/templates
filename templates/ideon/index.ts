import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const dbPassword = randomPassword();

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: dbPassword,
    },
  });

  const appEnv = [
    `APP_PORT=${input.appPort}`,
    `APP_URL=https://$(PRIMARY_DOMAIN)`,
    `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
    `DB_PORT=5432`,
    `DB_USER=postgres`,
    `DB_PASSWORD=${dbPassword}`,
    `DB_NAME=$(PROJECT_NAME)`,
    `PUID=1000`,
    `PGID=1000`,
  ];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: appEnv.join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: Number(input.appPort || "3000"),
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "app-data",
          mountPath: "/app/storage",
        },
      ],
    },
  });

  return { services };
}
