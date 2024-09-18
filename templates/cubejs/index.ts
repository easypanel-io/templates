import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secret = randomString(512);
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `CUBEJS_DEV_MODE=true`,
        `CUBEJS_TELEMETRY=false`,
        `CUBEJS_DB_TYPE=postgres`,
        `CUBEJS_DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `CUBEJS_DB_NAME=${input.databaseServiceName}`,
        `CUBEJS_DB_USER=postgres`,
        `CUBEJS_DB_PASS=${databasePassword}`,
        `CUBEJS_DB_PORT=5432`,
        `CUBEJS_DB_SSL=false`,
        `CUBEJS_API_SECRET=${secret}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 4000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/cube/conf",
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
