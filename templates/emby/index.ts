import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8096,
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
          name: "tvshows",
          mountPath: "/data/tvshows",
        },
        {
          type: "volume",
          name: "movies",
          mountPath: "/data/movies",
        },
        {
          type: "volume",
          name: "openmaxlibs",
          mountPath: "/opt/vc/lib",
        },
      ],
    },
  });

  return { services };
}
