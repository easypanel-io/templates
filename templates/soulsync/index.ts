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
          port: 8008,
        },
      ],
      ports: [
        {
          published: 8888,
          target: 8888,
          protocol: "tcp",
        },
        {
          published: 8889,
          target: 8889,
          protocol: "tcp",
        },
      ],
      env: [
        `TZ=${input.timezone || "UTC"}`,
        "PUID=0",
        "PGID=0",
        "UMASK=022",
        "FLASK_ENV=production",
        "PYTHONPATH=/app",
        "SOULSYNC_CONFIG_PATH=/app/config/config.json",
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "logs",
          mountPath: "/app/logs",
        },
        {
          type: "volume",
          name: "downloads",
          mountPath: "/app/downloads",
        },
        {
          type: "volume",
          name: "database",
          mountPath: "/app/database",
        },
        {
          type: "volume",
          name: "music",
          mountPath: "/music",
        },
      ],
    },
  });

  return { services };
}
