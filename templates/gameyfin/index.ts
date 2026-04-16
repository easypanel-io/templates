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
      env: [
        `APP_KEY=${appKey}`,
        `APP_URL=https://$(PRIMARY_DOMAIN)`,
        `PUID=${input.puid}`,
        `PGID=${input.pgid}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "db",
          mountPath: "/opt/gameyfin/db",
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/opt/gameyfin/data",
        },
        {
          type: "volume",
          name: "plugindata",
          mountPath: "/opt/gameyfin/plugindata",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/opt/gameyfin/logs",
        },
        {
          type: "volume",
          name: "library",
          mountPath: "/library",
        },
      ],
    },
  });

  return { services };
}
