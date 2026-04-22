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
      mounts: [
        {
          type: "bind",
          hostPath: input.scanPath,
          mountPath: "/workdir",
        },
      ],
      deploy: {
        command: input.scanCommand,
      },
    },
  });

  return { services };
}
