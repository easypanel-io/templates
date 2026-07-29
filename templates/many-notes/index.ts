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
      env: [`APP_URL=https://$(PRIMARY_DOMAIN)`].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "database",
          mountPath: "/var/www/html/database/sqlite",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/var/www/html/storage/logs",
        },
        {
          type: "volume",
          name: "private",
          mountPath: "/var/www/html/storage/app/private",
        },
        {
          type: "volume",
          name: "typesense",
          mountPath: "/var/www/html/typesense",
        },
      ],
    },
  });

  return { services };
}
