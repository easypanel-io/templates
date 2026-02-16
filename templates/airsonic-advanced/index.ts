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
          port: 4040,
        },
      ],
      ports: [
        {
          published: Number(input.upnpPort),
          target: 4041,
          protocol: "udp",
        },
      ],
      env: [
        `TZ=America/Los_Angeles`,
        `JAVA_OPTS=-Dserver.forward-headers-strategy=native`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "playlists",
          mountPath: "/var/playlists",
        },
        {
          type: "volume",
          name: "podcasts",
          mountPath: "/var/podcasts",
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/var/airsonic",
        },
        {
          type: "volume",
          name: "music",
          mountPath: "/var/music",
        },
      ],
    },
  });

  return { services };
}
