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
        image: input.appServiceImage ?? "getontime/ontime:latest",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 4001,
        },
      ],
      env: `TZ=${input.timezone ?? "UTC"}`,
      mounts: [
        {
          type: "volume",
          name: "ontime-data",
          mountPath: "/data",
        },
      ],
      ports: [
        {
          published: Number(input.oscInputPort),
          target: 8888,
          protocol: "udp",
        },
        {
          published: Number(input.oscOutputPort),
          target: 9999,
          protocol: "udp",
        },
      ],
    },
  });

  return { services };
}
