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
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/var/www/app/src/config",
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/var/www/app/data",
        },
        {
          type: "volume",
          name: "pages",
          mountPath: "/var/www/app/pages",
        },
      ],
    },
  });

  return { services };
}
