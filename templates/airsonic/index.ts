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
      mounts: [
        {
          type: "volume",
          name: "airsonic-data",
          mountPath: "/airsonic/data",
        },
        {
          type: "volume",
          name: "airsonic-music",
          mountPath: "/airsonic/music",
        },
        {
          type: "volume",
          name: "airsonic-playlists",
          mountPath: "/airsonic/playlists",
        },
        {
          type: "volume",
          name: "airsonic-podcasts",
          mountPath: "/airsonic/podcasts",
        },
      ],
      env: [`JAVA_OPTS=-Dserver.use-forward-headers=true`].join("\n"),
    },
  });

  return { services };
}
