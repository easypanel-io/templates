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
          port: 8688,
        },
      ],
      env: [`PORT=8688`, `TZ=${input.timezone}`].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/app/config",
        },
        {
          type: "volume",
          name: "cache",
          mountPath: "/app/cache",
        },
      ],
    },
  });

  return { services };
}
