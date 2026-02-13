import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const appKey = randomString(32);

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
      mounts: [
        {
          type: "volume",
          name: "gameyfin-db",
          mountPath: "/opt/gameyfin/db",
        },
        {
          type: "volume",
          name: "gameyfin-data",
          mountPath: "/opt/gameyfin/data",
        },
        {
          type: "volume",
          name: "gameyfin-logs",
          mountPath: "/opt/gameyfin/logs",
        },
        {
          type: "volume",
          name: "gameyfin-library",
          mountPath: "/opt/gameyfin/library",
        },
      ],
      env: [`APP_KEY=${appKey}`, `PUID=0`, `PGID=0`].join("\n"),
    },
  });

  return { services };
}
