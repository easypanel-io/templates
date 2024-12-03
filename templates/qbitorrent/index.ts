import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 8080 }],

      env: [
        `PUID=1000`,
        `PGID=1000`,
        `TZ=Etc/UTC`,
        `WEBUI_PORT=8080`,
        `TORRENTING_PORT=${input.qBittorrentPort}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "downloads",
          mountPath: "/downloads",
        },
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
        },
      ],
      ports: [
        {
          published: Number(input.qBittorrentPort),
          target: Number(input.qBittorrentPort),
          protocol: "tcp",
        },
        {
          published: Number(input.qBittorrentPort),
          target: Number(input.qBittorrentPort),
          protocol: "udp",
        },
      ],
    },
  });

  return { services };
}
