import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `USER_UID=1000`,
        `USER_GID=1000`,
        `TZ=${input.timezone}`,
        `ROOT_URL=https://${input.domain}`,
        `DOMAINMOD_WEB_ROOT=`,
        `DOMAINMOD_DATABASE_HOST=${input.projectName}_${input.databaseServiceName}`,
        `DOMAINMOD_DATABASE=domainmod`,
        `DOMAINMOD_USER=mysql`,
        `DOMAINMOD_PASSWORD=${databasePassword}`,
      ].join("\n"),
      source: {
        type: "image",
        image: "domainmod/domainmod",
      },
      proxy: {
        port: 80,
        secure: true,
      },
      domains: [{ name: input.domain }],
      mounts: [
        {
          type: "volume",
          name: "application",
          mountPath: "/var/www/html",
        },
      ],
      ports: [],
    },
  });

  services.push({
    type: "mysql",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
      image: "mysql:5.7",
    },
  });

  return { services };
}
