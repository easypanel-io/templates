import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const apiKey = randomString(512);
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `NANGO_DB_USER=postgres`,
        `NANGO_DB_PASSWORD=${databasePassword}`,
        `NANGO_DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `NANGO_DB_NAME=$(PROJECT_NAME)`,
        `NANGO_DB_PORT=5432`,
        "NANGO_DB_SSL=FALSE",
        `SERVER_PORT=3003`,
        `NANGO_SERVER_URL=https://$(PRIMARY_DOMAIN)`,
        `NANGO_DASHBOARD_USERNAME=${input.webUsername}`,
        `NANGO_DASHBOARD_PASSWORD=${input.webPassword}`,
        `NANGO_SECRET_KEY=${apiKey}`,
        `LOG_LEVEL=info`,
        `TELEMETRY=true`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3003,
        },
      ],
      mounts: [
        {
          type: "file",
          mountPath: "/usr/nango-server/src/packages/server/providers.yaml",
          content:
            "# Overwrite this file with this content: https://github.com/NangoHQ/nango/blob/master/packages/server/providers.yaml",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
