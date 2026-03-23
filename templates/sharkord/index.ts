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
          port: 4991,
        },
      ],
      ports: [
        {
          protocol: "tcp",
          published: Number(input.appServicePort) ?? 40000,
          target: 40000,
        },
        {
          protocol: "udp",
          published: Number(input.appServicePort) ?? 40000,
          target: 40000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/home/bun/.config/sharkord",
        },
      ],
    },
  });

  return { services };
}
