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
          port: 3000,
        },
      ],
      env: ["PUID=1000", "PGID=1000", "TZ=Etc/UTC"].join("\n"),
      mounts: [
        {
          type: "volume",
          name: `doublecommander-config`,
          mountPath: "/config",
        },
        {
          type: "volume",
          name: `doublecommander-data`,
          mountPath: "/data",
        },
      ],
    },
  });

  return { services };
}
