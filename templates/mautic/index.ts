import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mysqlPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `MAUTIC_DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `MAUTIC_DB_USER=mysql`,
        `MAUTIC_DB_PASSWORD=${mysqlPassword}`,
        `MAUTIC_DB_NAME=$(PROJECT_NAME)`,
        `MAUTIC_RUN_CRON_JOBS=true`,
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
          name: "mautic_data",
          mountPath: "/var/www/html",
        },
      ],
    },
  });

  services.push({
    type: "mysql",
    data: { serviceName: input.databaseServiceName, password: mysqlPassword },
  });

  return { services };
}
