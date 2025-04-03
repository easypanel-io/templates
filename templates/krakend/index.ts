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
      ports: [
        {
          published: 8080,
          target: 8080,
          protocol: "tcp",
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "krakend_config",
          mountPath: "/etc/krakend",
        },
      ],
    },
  });

  return { services };
}
