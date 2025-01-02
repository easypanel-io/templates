import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const dbPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        // autodeploy
        `JOOMLA_SITE_NAME: ${input.appSiteName}`,
        `JOOMLA_ADMIN_USER: ${input.appAdminUser}`,
        `JOOMLA_ADMIN_USERNAME: ${input.appAdminUserName}`,
        `JOOMLA_ADMIN_PASSWORD: ${input.appAdminPass}`,
        `JOOMLA_ADMIN_EMAIL: ${input.appAdminEmail}`,
        `JOOMLA_DB_HOST: $(PROJECT_NAME)_${input.databaseServiceName}`,
        `JOOMLA_DB_USER: root`,
        `JOOMLA_DB_PASSWORD: ${dbPassword}`,
        `JOOMLA_DB_NAME: $(PROJECT_NAME)`,
        `TZ: ${input.serviceTimezone}`,
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
          mountPath: "/var/www/html",
        },
        {
          type: "file",
          content: [
            "upload_max_filesize = 100M",
            "post_max_size = 100M",
            "",
          ].join("\n"),
          mountPath: "/usr/local/etc/php/conf.d/custom.ini",
        },
      ],
    },
  });

  services.push({
    type: input.databaseType,
    data: {
      serviceName: input.databaseServiceName,
      env: [`TZ: ${input.serviceTimezone}`].join("\n"),
      password: dbPassword,
      rootPassword: dbPassword,
    },
  });

  return { services };
}
