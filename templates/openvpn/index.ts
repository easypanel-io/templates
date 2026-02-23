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
          published: Number(input.mgmtServicePort),
          target: 943,
        },
        {
          published: Number(input.accessServicePort),
          target: 443,
        },
        {
          published: Number(input.vpnServicePort),
          target: 1194,
          protocol: "udp",
        },
      ],
      deploy: {
        capAdd: ["MKNOD", "NET_ADMIN"],
      },
      mounts: [
        {
          type: "volume",
          name: "openvpn-data",
          mountPath: "/openvpn",
        },
      ],
    },
  });

  return { services };
}
