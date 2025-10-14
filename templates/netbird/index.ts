import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [`NB_SETUP_KEY=${input.setupKey}`].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      mounts: [
        {
          type: "volume",
          name: "netbird-client",
          mountPath: "/var/lib/netbird",
        },
      ],
      deploy: {
        capAdd: ["NET_ADMIN", "SYS_ADMIN", "SYS_RESOURCE"],
      },
    },
  });

  return { services };
}
