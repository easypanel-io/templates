import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const databasePassword = randomPassword();
  const dbServiceName = `${input.appServiceName}-db`;

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
          port: 80,
        },
      ],
      env: [
        `SOSSE_DB_NAME=$(PROJECT_NAME)`,
        `SOSSE_DB_USER=postgres`,
        `SOSSE_DB_PASS=${databasePassword}`,
        `SOSSE_DB_HOST=$(PROJECT_NAME)_${dbServiceName}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/var/lib/sosse",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: dbServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
