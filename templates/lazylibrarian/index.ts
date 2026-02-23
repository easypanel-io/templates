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
        `TZ=Etc/UTC`,
        `DOCKER_MODS=linuxserver/mods:universal-calibre|linuxserver/mods:lazylibrarian-ffmpeg`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5299,
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
          name: "downloads",
          mountPath: "/downloads",
        },
        {
          type: "volume",
          name: "books",
          mountPath: "/books",
        },
      ],
    },
  });

  return { services };
}
