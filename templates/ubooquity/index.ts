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
          port: 2203,
          path: "/ubooquity/admin",
        },
      ],
      ports: [
        {
          published: Number(input.appServicePort),
          target: 2202,
          protocol: "tcp",
        },
      ],
      env: [`PUID=1000`, `PGID=1000`, `TZ=UTC`, `MAXMEM=1024`].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "ubooquity-config",
          mountPath: "/config",
        },
        {
          type: "volume",
          name: "ubooquity-books",
          mountPath: "/books",
        },
        {
          type: "volume",
          name: "ubooquity-comics",
          mountPath: "/comics",
        },
        {
          type: "volume",
          name: "ubooquity-files",
          mountPath: "/files",
        },
      ],
    },
  });

  return { services };
}
