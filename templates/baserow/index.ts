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
        image: "baserow/baserow:latest",
      },
      env: `BASEROW_PUBLIC_URL=https://${input.domain}`,
      proxy: {
        port: 80,
        secure: true,
      },
      mounts: [{ type: "volume", name: "data", mountPath: "/baserow/data" }],
    },
  });

  return { services };
}
