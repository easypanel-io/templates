import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const debugValue = input.debugMode ? "true" : "false";

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [`DEBUG=${debugValue}`].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "models",
          mountPath: "/build/models",
        },
      ],
    },
  });

  return { services };
}
