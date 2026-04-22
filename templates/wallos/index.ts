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
          port: 80,
        },
      ],
      env: [`TZ=America/Toronto`].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "wallos-db",
          mountPath: "/var/www/html/db",
        },
        {
          type: "volume",
          name: "wallos-logos",
          mountPath: "/var/www/html/images/uploads/logos",
        },
      ],
    },
  });

  return { services };
}
