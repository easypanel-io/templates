import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 3000 }],
      ports: [
        { protocol: "tcp", published: 53, target: 53 },
        { protocol: "udp", published: 53, target: 53 },
        { protocol: "udp", published: 784, target: 784 },
        { protocol: "tcp", published: 853, target: 853 },
        { protocol: "udp", published: 853, target: 853 },
        { protocol: "udp", published: 8853, target: 8853 },
        { protocol: "tcp", published: 5443, target: 5443 },
        { protocol: "udp", published: 5443, target: 5443 },
      ],
      mounts: [
        { type: "volume", name: "work", mountPath: "/opt/adguardhome/work" },
        { type: "volume", name: "conf", mountPath: "/opt/adguardhome/conf" },
      ],
    },
  });

  return { services };
}
