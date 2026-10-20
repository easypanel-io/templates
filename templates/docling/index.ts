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
      env: [`DOCLING_SERVE_ENABLE_UI=1`].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/ui",
          port: 5001,
        },
      ],
    },
  });

  return { services };
}
