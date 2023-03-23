import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: ["INIT_ASSETS=1"].join("\n"),
      source: { type: "image", image: input.appServiceImage },
      proxy: { port: 8080, secure: true },
      domains: input.domain ? [{ name: input.domain }] : [],
      mounts: [
        {
          type: "volume",
          name: "assets",
          mountPath: "/www/assets",
        },
      ],
    },
  });

  return { services };
}
