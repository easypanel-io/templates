import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const dbServiceName = `${input.appServiceName}-db`;
  const valkeyServiceName = `${input.appServiceName}-valkey`;
  const dbPassword = randomPassword();
  const valkeyPassword = randomPassword();
  const timezone = input.timezone || "Etc/UTC";

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `SEARCH_API_URL=https://search.pinepods.online/api/search`,
        `PEOPLE_API_URL=https://people.pinepods.online`,
        `HOSTNAME=https://$(PRIMARY_DOMAIN)`,
        `DB_TYPE=postgresql`,
        `DB_HOST=$(PROJECT_NAME)_${dbServiceName}`,
        `DB_PORT=5432`,
        `DB_USER=postgres`,
        `DB_PASSWORD=${dbPassword}`,
        `DB_NAME=$(PROJECT_NAME)`,
        `VALKEY_HOST=$(PROJECT_NAME)-${valkeyServiceName}`,
        `VALKEY_PORT=6379`,
        `VALKEY_PASSWORD=${valkeyPassword}`,
        `DEBUG_MODE=false`,
        `PUID=911`,
        `PGID=911`,
        `TZ=${timezone}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8040,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "downloads",
          mountPath: "/opt/pinepods/downloads",
        },
        {
          type: "volume",
          name: "backups",
          mountPath: "/opt/pinepods/backups",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: dbServiceName,
      password: dbPassword,
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: valkeyServiceName,
      image: "valkey/valkey:8-alpine",
      password: valkeyPassword,
      command: `valkey-server --requirepass ${valkeyPassword}`,
    },
  });

  return { services };
}
