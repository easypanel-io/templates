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
        image: "rofl256/whiteboard",
      },
      proxy: {
        port: 8080,
        secure: true,
      },
      domains: [{ name: input.domain }],
    },
  });

  return { services };
}
