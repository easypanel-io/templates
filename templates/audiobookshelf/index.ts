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
          name: "config",
          mountPath: "/config",
        },
        {
          type: "volume",
          name: "metadata",
          mountPath: "/metadata",
        },
        {
          type: "bind",
          hostPath: input.hostPath,
          mountPath: "/audiobooks",
        },
      ],
      proxy: {
        port: 80,
        secure: true,
      },
      domains: [
        {
          name: input.domain,
        },
      ],
    },
  });

  return { services };
}
