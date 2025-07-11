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
          port: 6157,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "opengist",
          mountPath: "/opengist",
        },
      ],
    },
  });

  return { services };
}
