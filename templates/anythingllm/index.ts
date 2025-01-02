import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [`STORAGE_DIR="/app/server/storage"`].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        capAdd: ["SYS_ADMIN"],
      },
      domains: [
        {
          host: `$(EASYPANEL_DOMAIN)`,
          port: 3001,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "storage",
          mountPath: "/app/server/storage",
        },
      ],
    },
  });

  return { services };
}
