import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/config",
        },
      ],
      proxy: {
        port: 3000,
        secure: true,
      },
      deploy: {
        capAdd: ["IPC_LOCK"],
      },
    },
  });

  return { services };
}
