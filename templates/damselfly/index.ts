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
      mounts: [
        {
          type: "volume",
          name: "damselfly-config",
          mountPath: "/config",
        },
        {
          type: "volume",
          name: "damselfly-thumbs",
          mountPath: "/thumbs",
        },
        {
          type: "volume",
          name: "damselfly-photos",
          mountPath: "/pictures",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 6363,
        },
      ],
    },
  });

  return { services };
}
