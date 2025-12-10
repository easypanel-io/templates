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
        `ADMIN_EMAIL=${input.adminEmail}`,
        `ADMIN_FIRST_NAME=${input.appServiceName}`,
        `ADMIN_LAST_NAME=User`,
        `ADMIN_PASS=${input.adminPassword}`,
        `APPLICATION_NAME=${input.appServiceName}`,
        `DB_TYPE=mysql`,
        `DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `DB_PORT=3306`,
        `DB_USER=mysql`,
        `DB_PASS=${mysqlPassword}`,
        `DB_NAME=$(PROJECT_NAME)`,
        `SITE_URL=https://$(PRIMARY_DOMAIN)`,
        `APP_FORCE_HTTPS=true`,
        `ENABLE_SSL_PROXY=true`,
        `DISPLAY_ERRORS=false`,
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
          name: "logs",
          mountPath: "/www/logs",
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
        {
          type: "volume",
          name: "modules",
          mountPath: "/assets/modules",
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
