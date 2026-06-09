import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8069,
        },
      ],
      env: [
        `HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `USER=postgres`,
        `PASSWORD=${databasePassword}`,
        `PORT=5432`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "odoo-web-data",
          mountPath: "/var/lib/odoo",
        },
        {
          type: "volume",
          name: "odoo-config",
          mountPath: "/etc/odoo",
        },
        {
          type: "volume",
          name: "odoo-addons",
          mountPath: "/mnt/extra-addons",
        },
      ],
    },
  });

  return { services };
}
