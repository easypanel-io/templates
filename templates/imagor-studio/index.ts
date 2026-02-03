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
          port: 8080,
        },
      ],
      env: [
        "DATABASE_URL=sqlite:///app/data/imagor-studio.db",
        "PORT=8080",
        "PUID=0",
        "PGID=0",
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/app/data",
        },
        {
          type: "volume",
          name: "gallery",
          mountPath: "/app/gallery",
        },
      ],
    },
  });

  return { services };
}
