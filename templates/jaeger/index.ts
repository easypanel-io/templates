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
          published: Number(input.compactFormat),
          target: 5775,
        },
        {
          protocol: "udp",
          published: Number(input.jaegerInstrumentation),
          target: 6831,
        },
        {
          protocol: "udp",
          published: Number(input.binaryFormat),
          target: 6832,
        },
        {
          protocol: "tcp",
          published: Number(input.portSampling),
          target: 5778,
        },
        {
          protocol: "tcp",
          published: Number(input.collectorPort),
          target: 14268,
        },
        {
          protocol: "tcp",
          published: Number(input.zipkinPort),
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
