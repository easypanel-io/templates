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
        `WORDPRESS_DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `WORDPRESS_DB_USER=${input.databaseType}`,
        `WORDPRESS_DB_PASSWORD=${mysqlPassword}`,
        `WORDPRESS_DB_NAME=$(PROJECT_NAME)`,
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
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: mysqlPassword,
    },
  });

  return { services };
}
