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
          port: 16686,
        },
      ],
      ports: [
        {
          protocol: "udp",
          published: 5775,
          target: 5775,
        },
        {
          protocol: "udp",
          published: 6831,
          target: 6831,
        },
        {
          protocol: "udp",
          published: 6832,
          target: 6832,
        },
        {
          protocol: "tcp",
          published: 5778,
          target: 5778,
        },
        {
          protocol: "tcp",
          published: 16686,
          target: 16686,
        },
        {
          protocol: "tcp",
          published: 14268,
          target: 14268,
        },
        {
          protocol: "tcp",
          published: 9411,
          target: 9411,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "tmp",
          mountPath: "/tmp",
        },
      ],
    },
  });

  return { services };
}
