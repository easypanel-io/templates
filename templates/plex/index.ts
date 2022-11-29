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
      env: "VERSION=docker",
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
        },
        {
          type: "volume",
          name: "tv",
          mountPath: "/tv",
        },
        {
          type: "volume",
          name: "movies",
          mountPath: "/movies",
        },
      ],
      proxy: {
        port: 32400,
        secure: true,
      },
    },
  });

  return { services };
}
