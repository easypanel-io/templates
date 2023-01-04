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
        `ADMIN_EMAIL=changeme@easypanel.io`,
        `ADMIN_FIRST_NAME=Admin`,
        `ADMIN_LAST_NAME=User`,
        `ADMIN_PASS=changeme`,
        `APPLICATION_NAME=Freescout`,
        `DB_TYPE=mysql`,
        `DB_HOST=${input.projectName}_${input.databaseServiceName}`,
        `DB_PORT=3306`,
        `DB_USER=mysql`,
        `DB_PASS=${mysqlPassword}`,
        `DB_NAME=${input.projectName}`,
        `SITE_URL=https://${input.domain},`
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
