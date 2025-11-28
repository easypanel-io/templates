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
          port: 4567,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "downloads",
          mountPath: "/home/suwayomi/.local/share/Tachidesk/downloads",
        },
        {
          type: "volume",
          name: "files",
          mountPath: "/home/suwayomi/.local/share/Tachidesk",
        },
      ],
    },
  });

  return { services };
}
