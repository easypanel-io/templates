import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: { type: "image", image: "lissy93/dashy" },
      proxy: { port: 80 },
      env: `NODE_ENV=production`,
    },
  });

  return { services };
}
