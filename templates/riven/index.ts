import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const dbServiceName = `${input.appServiceName}-db`;
  const dbPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `PUID=1000`,
        `PGID=1000`,
        `TZ=${input.timezone || "Etc/UTC"}`,
        `RIVEN_FORCE_ENV=true`,
        `RIVEN_DATABASE_HOST=postgresql+psycopg2://postgres:${dbPassword}@$(PROJECT_NAME)_${dbServiceName}:5432/riven`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/riven/data",
        },
        {
          type: "volume",
          name: "mount",
          mountPath: "/mount",
        },
      ],
      deploy: {
        capAdd: ["SYS_ADMIN"],
      },
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: dbServiceName,
      databaseName: "riven",
      password: dbPassword,
    },
  });

  return { services };
}
