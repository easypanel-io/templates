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
          port: 8090,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "beszel_data",
          mountPath: "/beszel_data",
        },
      ],
    },
  });

  return { services };
}
