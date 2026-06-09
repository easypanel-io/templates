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
          port: 8080,
        },
      ],
      ports: [
        {
          published: Number(input.exposeClickHousePort),
          target: 8123,
          protocol: "tcp",
        },
        {
          published: Number(input.exposeOtelPort),
          target: 4317,
          protocol: "tcp",
        },
      ],
    },
  });

  return { services };
}
