import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

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
        `TZ=UTC`,
        `DATA_DIR=/app/data`,
        `BACKUP_DIR=/app/backups`,
        `LOGS_DIR=/app/data/logs`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/app/data",
        },
        {
          type: "volume",
          name: "backups",
          mountPath: "/app/backups",
        },
      ],
    },
  });

  return { services };
}
