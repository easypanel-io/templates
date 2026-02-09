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
          port: 51821,
        },
      ],
      ports: [
        {
          published: Number(input.appServicePort),
          target: 51820,
          protocol: "udp",
        },
      ],
      deploy: {
        capAdd: ["NET_ADMIN", "SYS_MODULE"],
      },
      mounts: [
        {
          type: "volume",
          name: "wg-config",
          mountPath: "/etc/wireguard",
        },
        {
          type: "bind",
          hostPath: "/lib/modules",
          mountPath: "/lib/modules",
        },
      ],
    },
  });

  return { services };
}
