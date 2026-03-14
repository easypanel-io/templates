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
        image: input.appServiceImage ?? "mnemosyneai/doppelganger:v0.9.3",
      },
      env: "NODE_ENV=production",
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 11345,
        },
        {
          host: "vnc-$(EASYPANEL_DOMAIN)",
          port: 54311,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/app/data",
        },
      ],
    },
  });

  return { services };
}
