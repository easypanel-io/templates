import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `POSTFIXADMIN_DB_TYPE=mysqli`,
        `POSTFIXADMIN_DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-mysql`,
        `POSTFIXADMIN_DB_USER=mysql`,
        `POSTFIXADMIN_DB_PASSWORD=${databasePassword}`,
        `POSTFIXADMIN_DB_NAME=$(PROJECT_NAME)`,
        `POSTFIXADMIN_SMTP_SERVER=${input.smtpServer}`,
        `POSTFIXADMIN_SMTP_PORT=${input.smtpPort}`,
        `POSTFIXADMIN_ENCRYPT=md5crypt`,
        `POSTFIXADMIN_DKIM=YES`,
        `POSTFIXADMIN_DKIM_ALL_ADMINS=NO`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/var/www/html/",
        },
      ],
    },
  });

  services.push({
    type: "mysql",
    data: {
      serviceName: `${input.appServiceName}-mysql`,
      password: databasePassword,
    },
  });

  return { services };
}
