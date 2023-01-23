import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const dbPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `HUMHUB_DB_HOST=${input.projectName}_${input.databaseServiceName}`,
        `HUMHUB_DB_NAME=${input.projectName}`,
        `HUMHUB_DB_USER=mariadb`,
        `HUMHUB_DB_PASSWORD=${dbPassword}`,
      ].join("\n"),
      proxy: {
        port: 80,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/var/www/localhost/htdocs/protected/config",
        },
        {
          type: "volume",
          name: "uploads",
          mountPath: "/var/www/localhost/htdocs/uploads",
        },
        {
          type: "volume",
          name: "modules",
          mountPath: "/var/www/localhost/htdocs/protected/modules",
        },
      ],
    },
  });

  services.push({
    type: "mariadb",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      image: "mariadb:10.2",
      password: dbPassword,
    },
  });

  return { services };
}
