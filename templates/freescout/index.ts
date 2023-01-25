import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mysqlPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `ADMIN_EMAIL=${input.adminEmail}`,
        `ADMIN_FIRST_NAME=${input.appServiceName}`,
        `ADMIN_LAST_NAME=User`,
        `ADMIN_PASS=${input.adminPassword}`,
        `APPLICATION_NAME=${input.appServiceName}`,
        `DB_TYPE=mysql`,
        `DB_HOST=${input.projectName}_${input.databaseServiceName}`,
        `DB_PORT=3306`,
        `DB_USER=mysql`,
        `DB_PASS=${mysqlPassword}`,
        `DB_NAME=${input.projectName}`,
        `SITE_URL=https://${input.domain}`,
        `APP_FORCE_HTTPS=true`,
        `ENABLE_SSL_PROXY=true`,
        `DISPLAY_ERRORS=false`
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 80,
        secure: true,
      },
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
          mountPath: "/assets/modules"
        },
      ],
          domains: [
        {
          name: input.domain,
        },
      ],
    },
  });

  services.push({
    type: "mysql",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: mysqlPassword,
    },
  });

  return { services };
}
