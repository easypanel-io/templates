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
      mounts: [
        {
          type: "volume",
          name: "dumbdrop-uploads",
          mountPath: "/app/uploads",
        },
      ],
      env: [
        `DUMBDROP_TITLE=DumbDrop`,
        `MAX_FILE_SIZE=1024`,
        `DUMBDROP_PIN=`,
        `AUTO_UPLOAD=false`,
        `BASE_URL=https://$(PRIMARY_DOMAIN)`,
      ].join("\n"),
    },
  });

  return { services };
}
