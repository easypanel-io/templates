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
          port: 3001,
        },
      ],
      env: [`DOWNLOAD_FOLDER=/app/downloads`].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "downloads",
          mountPath: "/app/downloads",
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/app/backend/data",
        },
      ],
    },
  });

  return { services };
}
