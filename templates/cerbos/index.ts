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
          port: 3592,
        },
      ],
      ports: [
        {
          protocol: "tcp",
          published: 3593,
          target: 3593,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "policies",
          mountPath: "/policies",
        },
      ],
    },
  });

  return { services };
}
