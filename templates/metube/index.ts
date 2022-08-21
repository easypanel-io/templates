import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.serviceName,
      source: {
        type: "image",
        image: "alexta69/metube",
      },
      proxy: {
        port: 8081,
        secure: true,
      },
      domains: [{ name: input.domain }],
      mounts: [
        {
          type: "volume",
          name: input.downloadPath,
          mountPath: "/downloads",
        },
      ],
    },
  });

  return { services };
}
