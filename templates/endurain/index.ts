import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const secretKey = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `TZ=Europe/Lisbon`,
        `DB_TYPE=postgres`,
        `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `DB_PORT=5432`,
        `DB_PASSWORD=${databasePassword}`,
        `DB_DATABASE=$(PROJECT_NAME)`,
        `DB_USER=postgres`,
        `SECRET_KEY=${secretKey}`,
        `GEOCODES_MAPS_API=changeme`,
        `ENDURAIN_HOST=https://$(PRIMARY_DOMAIN)`,
        `BEHIND_PROXY=true`,
      ].join("\n"),
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
      mounts: [
        {
          type: "volume",
          name: "user_images",
          mountPath: "/app/backend/user_images",
        },
        {
          type: "volume",
          name: "bulk_import",
          mountPath: "/app/backend/files/bulk_import",
        },
        {
          type: "volume",
          name: "processed",
          mountPath: "/app/backend/files/processed",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/app/backend/logs",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  return { services };
}
