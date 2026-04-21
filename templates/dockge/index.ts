import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5001,
        },
      ],
      mounts: [
        {
          type: "bind",
          hostPath: "/var/run/docker.sock",
          mountPath: "/var/run/docker.sock",
        },
        {
          type: "volume",
          name: "dockge-data",
          mountPath: "/app/data",
        },
        {
          type: "volume",
          name: "dockge-stacks",
          mountPath: "/root/dockge/stacks",
        },
      ],
      env: ["DOCKGE_STACKS_DIR=/root/dockge/stacks"].join("\n"),
    },
  });

  return { services };
}
