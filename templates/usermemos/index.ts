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
      mounts: [
        {
          type: "volume",
          name: "memos",
          mountPath: "/var/opt/memos",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5230,
        },
      ],
    },
  });

  return { services };
}
