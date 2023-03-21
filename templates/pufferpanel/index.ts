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
      ports: [
        {
          published: 2222,
          target: 22,
          protocol: "tcp",
        },
        {
          published: 5657,
          target: 5657,
          protocol: "tcp",
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "base",
          mountPath: "/var/lib/pufferpanel",
        },
      ],
    },
  });

  return { services };
}
