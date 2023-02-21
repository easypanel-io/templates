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
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: { port: 8069, secure: true },
      env: [
        `HOST=${input.projectName}_${input.databaseServiceName}`,
        `USER=odoo`,
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
  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      source: {
        type: "image",
        image: "postgres:13",
      },
      env: [
        `POSTGRES_DB=postgres`,
        `POSTGRES_PASSWORD=${databasePassword}`,
        `POSTGRES_USER=odoo`,
        `PGDATA=/var/lib/postgresql/data/pgdata`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "odoo-db-data",
          mountPath: "/var/lib/postgresql/data/pgdata",
        },
      ],
    },
  });

  return { services };
}
