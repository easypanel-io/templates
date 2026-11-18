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
  const jwtSecret = randomString(64);

  const dbConnectionString = `postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`;

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
      image: input.databaseImage ?? "postgres:17.9-alpine3.23",
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
          port: 8086,
        },
      ],
      env: [
        `OXICLOUD_DB_CONNECTION_STRING=${dbConnectionString}`,
        `DATABASE_URL=${dbConnectionString}`,
        `OXICLOUD_JWT_SECRET=${jwtSecret}`,
        `OXICLOUD_SERVER_HOST=0.0.0.0`,
        `OXICLOUD_SERVER_PORT=8086`,
        `OXICLOUD_BASE_URL=https://$(PRIMARY_DOMAIN)`,
        `MIMALLOC_PURGE_DELAY=0`,
        `MIMALLOC_ALLOW_LARGE_OS_PAGES=0`,
      ].join("\n"),
      deploy: {
        command:
          "sed '/^::1/s/localhost//' /etc/hosts > /tmp/hosts && cat /tmp/hosts > /etc/hosts; exec entrypoint.sh oxicloud",
      },
      mounts: [
        {
          type: "volume",
          name: "storage_data",
          mountPath: "/app/storage",
        },
      ],
    },
  });

  return { services };
}
