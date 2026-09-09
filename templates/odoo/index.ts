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
      user: "odoo",
      databaseName: input.appServiceName,
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
      deploy: {
        command: `odoo --db_host=$(PROJECT_NAME)_${input.appServiceName}-db --db_port=5432 --db_user=odoo --db_password=${databasePassword} -d ${input.appServiceName} -i base --without-demo=True`,
      },
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
