import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "github",
        owner: "stackblitz-labs",
        repo: "bolt.diy",
        ref: "main",
        path: "/",
        autoDeploy: false,
      },
      build: {
        type: "dockerfile",
      },
      mounts: [
        {
          type: "volume",
          name: "app",
          mountPath: "/app",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5173,
        },
      ],
    },
  });

  return { services };
}
