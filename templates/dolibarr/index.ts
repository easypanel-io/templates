import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databaseRootPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `DOLI_DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `DOLI_DB_USER=root`,
        `DOLI_DB_PASSWORD=${databaseRootPassword}`,
        `DOLI_DB_NAME=$(PROJECT_NAME)`,
        `DOLI_URL_ROOT=https://$(PRIMARY_DOMAIN)`,
        `PHP_INI_DATE_TIMEZONE=Europe/Paris`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: `$(EASYPANEL_DOMAIN)`,
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "volume-scripts",
          mountPath: "/var/www/scripts/docker-init.d",
        },
        {
          type: "volume",
          name: "before-starting-scripts",
          mountPath: "/var/www/scripts/before-starting.d",
        },
      ],
    },
  });

  services.push({
    type: "mariadb",
    data: {
      serviceName: `${input.appServiceName}-db`,
      rootPassword: databaseRootPassword,
    },
  });

  return { services };
}
