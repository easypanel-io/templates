import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 8384 }],
      mounts: [{ type: "volume", name: "data", mountPath: "/var/syncthing" }],
      ports: [
        { published: 22000, target: 22000, protocol: "tcp" },
        { published: 22000, target: 22000, protocol: "udp" },
        { published: 21027, target: 21027, protocol: "udp" },
      ],
    },
  });

  return { services };
}
