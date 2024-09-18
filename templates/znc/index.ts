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
      env: [
        `PUID=${input.PUID}`,
        `PGID=${input.PGID}`,
        `TZ=${input.serviceTimezone}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 6501,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "znc-config",
          mountPath: "/config",
        },
      ],
    },
  });

  return { services };
}
