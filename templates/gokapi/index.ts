import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: ["TZ=UTC"].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/setup",
          port: 53842,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/app/config",
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/app/data",
        },
      ],
    },
  });

  return { services };
}
