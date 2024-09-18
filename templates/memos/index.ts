import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [`PUID=1000`, `PGID=1000`, `TZ=${input.serviceTimezone}`].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5230,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "memos",
          mountPath: "/var/opt/memos",
        },
      ],
    },
  });

  return { services };
}
