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
          port: 8222,
        },
      ],
      ports: [
        {
          published: Number(input.appServicePort),
          target: 4222,
        },
        {
          published: Number(input.appServiceClusterPort),
          target: 6222,
        },
      ],
    },
  });

  return { services };
}
