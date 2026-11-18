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
      env: ["COOK_CORS_ORIGIN=https://$(PRIMARY_DOMAIN)"].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 9080,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "recipes",
          mountPath: "/recipes",
        },
      ],
    },
  });

  return { services };
}
