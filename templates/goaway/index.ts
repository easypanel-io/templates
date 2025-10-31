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
          published: Number(input.dnsPort),
          target: 53,
          protocol: "tcp",
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "goaway-data",
          mountPath: "/home/appuser",
        },
      ],
      deploy: {
        capAdd: ["NET_BIND_SERVICE", "NET_RAW"],
      },
    },
  });

  return { services };
}
