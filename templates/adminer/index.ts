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
        image: "adminer",
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
