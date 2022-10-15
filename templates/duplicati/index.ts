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
        image: "linuxserver/duplicati",
      },
      proxy: {
        port: 8200,
        secure: true,
      },
      env: "TZ=Europe/London",
      mounts: [
        {
          type: "bind",
          hostPath: "/",
          mountPath: "/host",
        },
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
        },
      ],
    },
  });

  return { services };
}
