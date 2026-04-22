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
      ports: [
        {
          published: Number(input.gamePort),
          target: 7777,
          protocol: "udp",
        },
        {
          published: Number(input.beaconPort),
          target: 15000,
          protocol: "udp",
        },
        {
          published: Number(input.queryPort),
          target: 15777,
          protocol: "udp",
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
        },
      ],
      env: [
        `MAXPLAYERS=${input.maxPlayers}`,
        `PGID=1000`,
        `PUID=1000`,
        `ROOTLESS=false`,
        `STEAMBETA=false`,
      ].join("\n"),
    },
  });

  return { services };
}
