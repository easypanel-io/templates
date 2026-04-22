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
          port: 8080,
        },
      ],
      env: [`NO_CORS=1`, `AUTO_SERVER_URL=1`].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/root/.stremio-server",
        },
      ],
    },
  });

  return { services };
}
