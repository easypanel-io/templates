import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const databaseRootPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `MYSQL_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `MYSQL_ROOT_PASS=${databaseRootPassword}`,
        `MYSQL_USER=mariadb`,
        `MYSQL_PASS=${databasePassword}`,
        `OE_USER=${input.adminUser}`,
        `OE_PASS=${input.adminPassword}`,
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
          name: "data",
          mountPath: "/var/www/localhost/htdocs/openemr/sites",
        },
        {
          type: "volume",
          name: "log",
          mountPath: "/var/log",
        },
      ],
    },
  });

  services.push({
    type: "mariadb",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
      rootPassword: databaseRootPassword,
    },
  });

  return { services };
}
