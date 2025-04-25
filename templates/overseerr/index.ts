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
      env: [`PUID=1000`, `PGID=1000`, `TZ=Etc/UTC`].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5055,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "overseerr-config",
          mountPath: "/config",
        },
      ],
    },
  });

  return { services };
}
