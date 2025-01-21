import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [].join("\n"),
      source: { type: "image", image: input.appServiceImage },
      domains: [
        {
          host: "sourcegraph-$(EASYPANEL_DOMAIN)",
          port: 7080,
        },
        {
          host: "grafana-$(EASYPANEL_DOMAIN)",
          port: 3370,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "sourcegraph",
          mountPath: "/etc/sourcegraph",
        },
        {
          type: "volume",
          name: "sourcegraph-opt",
          mountPath: "/var/opt/sourcegraph",
        },
      ],
    },
  });

  return { services };
}
