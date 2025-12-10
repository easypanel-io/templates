import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `PASSWORD=${input.password}`,
        `TZ=Etc/UTC`,
        `PUID=1000`,
        `PGID=1000`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "books",
          mountPath: "/books",
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/config",
        },
      ],
    },
  });

  return { services };
}
