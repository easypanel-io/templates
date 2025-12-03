import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `PUID=1000`,
        `PGID=1000`,
        `TZ=${input.timezone}`,
        `HARDCOVER_TOKEN=${input.hardcoverToken}`,
        `NETWORK_SHARE_MODE=false`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8083,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
        },
        {
          type: "volume",
          name: "ingest",
          mountPath: "/cwa-book-ingest",
        },
        {
          type: "volume",
          name: "library",
          mountPath: "/calibre-library",
        },
        {
          type: "volume",
          name: "plugins",
          mountPath: "/config/.config/calibre/plugins",
        },
      ],
    },
  });

  return { services };
}
