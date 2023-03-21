import {
  Output,
  randomPassword,
  randomString,
  Services
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const apiKey = randomString(512);
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `NANGO_DB_USER=postgres`,
        `NANGO_DB_PASSWORD=${databasePassword}`,
        `NANGO_DB_HOST=${input.projectName}_${input.databaseServiceName}`,
        `NANGO_DB_NAME=${input.projectName}`,
        `NANGO_DB_PORT=5432`,
        'NANGO_DB_SSL=FALSE',
        `SERVER_PORT=3003`,
        `NANGO_SERVER_URL=https://${input.domain}`,
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
      proxy: {
        port: 3003,
        secure: true,
      },
      mounts: [
        {
          type: "file",
          mountPath: "/usr/nango-server/src/packages/server/providers.yaml",
          content: "# Overwrite this file with this content: https://github.com/NangoHQ/nango/blob/master/packages/server/providers.yaml",
        },
      ],
      domains: [
        {
          name: input.domain,
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
