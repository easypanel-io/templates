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
          port: 8086,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/var/lib/influxdb2",
        },
        {
          type: "volume",
          name: "config",
          mountPath: "/etc/influxdb2",
        },
      ],
    },
  });

  return { services };
}
