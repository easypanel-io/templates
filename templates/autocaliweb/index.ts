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
          port: 8083,
        },
      ],
      env: [
        `TZ=${input.timezone}`,
        `PUID=0`,
        `PGID=0`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
        },
        {
          type: "volume",
          name: "ingest",
          mountPath: "/acw-book-ingest",
        },
        {
          type: "volume",
          name: "library",
          mountPath: "/calibre-library",
        },
      ],
    },
  });

  return { services };
}
