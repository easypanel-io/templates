import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `FLOWISE_USERNAME=${input.username}`,
        `FLOWISE_PASSWORD=${input.password}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 80,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/.root/flowise",
        },
      ],
      deploy: {
        command: "sleep 3; flowise start",
      },
    },
  });

  return { services };
}
