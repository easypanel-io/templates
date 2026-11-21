import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      // the app's backups use the PostgreSQL 17 client, which needs a server of 17 or older
      image: "postgres:17",
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
          port: 8080,
        },
      ],
      env: [
        `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`,
        `APP_URL=https://$(EASYPANEL_DOMAIN)`,
        `TRUST_PROXY=1`,
        `SIGNUPS=open`,
        `AUTH_PASSWORD=on`,
        `UPDATE_CHECK=off`,
        `BACKUP_DIR=/backups`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "backups",
          mountPath: "/backups",
        },
      ],
    },
  });

  return { services };
}
