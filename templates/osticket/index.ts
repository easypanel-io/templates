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
        `TIMEZONE=America/Vancouver`,
        `CONTAINER_NAME=osticket-app`,
        `CRON_INTERVAL=10`,
        `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `DB_NAME=$(PROJECT_NAME)`,
        `DB_USER=mariadb`,
        `DB_PASS=${databasePassword}`,

        `SMTP_HOST=${input.smtpServerHost}`,
        `SMTP_PORT=${input.smtpServerPort}`,
        `SMTP_FROM=${input.smtpFromEmail}`,
        `SMTP_TLS=0`,
        `SMTP_USER=${input.smtpServerUsername ? input.smtpServerUsername : ""}`,
        `SMTP_PASS=${input.smtpServerPassword ? input.smtpServerPassword : ""}`,

        `INSTALL_SECRET=somerandomlargecharacterstring`,

        `INSTALL_EMAIL=${input.installEmail}`,
        `INSTALL_NAME=${input.installName}`,

        `ADMIN_FIRSTNAME=${input.adminFirstName}`,
        `ADMIN_LASTNAME=${input.adminLastName}`,
        `ADMIN_EMAIL=${input.adminEmail}`,
        `ADMIN_USER=${input.adminUsername}`,
        `ADMIN_PASS=${input.adminPassword}`,
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
          name: "osticket-data",
          mountPath: "/www/osticket",
        },
        {
          type: "volume",
          name: "osticket-logs",
          mountPath: "/www/logs",
        },
      ],
    },
  });

  services.push({
    type: "mariadb",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  return { services };
}
