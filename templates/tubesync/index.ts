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
        `TZ=Europe/London`,
        `PUID=1000`,
        `PGID=1000`,
        `HTTP_USER=${input.username}`,
        `HTTP_PASS=${input.password}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 4848,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
        },
        {
          type: "volume",
          name: "downloads",
          mountPath: "/downloads",
        },
      ],
    },
  });

  return { services };
}
