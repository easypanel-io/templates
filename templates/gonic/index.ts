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
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "gonic-data",
          mountPath: "/data",
        },
        {
          type: "volume",
          name: "gonic-cache",
          mountPath: "/cache",
        },
        {
          type: "volume",
          name: "music",
          mountPath: "/music",
        },
        {
          type: "volume",
          name: "podcasts",
          mountPath: "/podcasts",
        },
        {
          type: "volume",
          name: "playlists",
          mountPath: "/playlists",
        },
      ],
    },
  });

  return { services };
}
