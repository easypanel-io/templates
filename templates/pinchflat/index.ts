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
          port: 8945,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "pinchflat-config",
          mountPath: "/config",
        },
        {
          type: "volume",
          name: "pinchflat-downloads",
          mountPath: "/downloads",
        },
      ],
      env: [`TZ=America/New_York`].join("\n"),
    },
  });

  return { services };
}
