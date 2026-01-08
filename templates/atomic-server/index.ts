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
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "atomic-storage",
          mountPath: "/atomic-storage",
        },
      ],
      env: [
        `ATOMIC_DOMAIN=$(PRIMARY_DOMAIN)`,
        `ATOMIC_PORT=80`,
        `ATOMIC_HTTPS=false`,
        `ATOMIC_SERVER_URL=https://$(PRIMARY_DOMAIN)`,
      ].join("\n"),
    },
  });

  return { services };
} 