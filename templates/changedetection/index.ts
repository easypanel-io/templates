import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: { type: "image", image: "ghcr.io/dgtlmoon/changedetection.io" },
      mounts: [{ type: "volume", name: "datastore", mountPath: "/datastore" }],
      domains: [{ name: input.domain }],
      proxy: { port: 5000 },
    },
  });
  return { services };
}
