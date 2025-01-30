import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [`SD_AUTH=${input.username}:${input.password}`].join("\n"),
      source: { type: "image", image: input.appServiceImage },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "spacedrive",
          mountPath: "/var/spacedrive",
        },
      ],
    },
  });

  return { services };
}
