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
        image: "registry:2",
      },
      proxy: {
        port: 5000,
        secure: true,
      },
      mounts: [
        { type: "volume", name: "data", mountPath: "/var/lib/registry" },
      ],
      deploy: {
        zeroDowntime: true,
      },
      basicAuth: [{ username: input.user, password: input.password }],
    },
  });

  return { services };
}
