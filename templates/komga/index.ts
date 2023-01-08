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
      proxy: {
        port: 8080,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
        {
          type: "bind",
          hostPath: "/etc/timezone",
          mountPath: "/etc/timezone",
        },
      ],
    },
  });

  return { services };
}
