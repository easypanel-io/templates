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
      env: [`TZ=${input.timezone}`].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
        },
        {
          type: "volume",
          name: "media",
          mountPath: "/media",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 7889,
        },
      ],
    },
  });

  return { services };
}
