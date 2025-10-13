import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [`PASSWORD=${input.password}`].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8787,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "rstudio_data",
          mountPath: "/home/rstudio",
        },
      ],
    },
  });

  return { services };
}
