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
          port: 3000,
        },
      ],
      env: [`MEDIA_PATH=/media_data`].join("\n"),
      mounts: [
        {
          type: "bind",
          hostPath: `${input.mediaPath}`,
          mountPath: "/media_data",
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/app/storage",
        },
      ],
    },
  });

  return { services };
}
