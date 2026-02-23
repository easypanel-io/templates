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
      env: [`SYMFONY__ENV__DOMAIN_NAME=https://$(PRIMARY_DOMAIN)`].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "images",
          mountPath: "/var/www/wallabag/web/assets/images",
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/var/www/wallabag/data",
        },
      ],
    },
  });

  return { services };
}
