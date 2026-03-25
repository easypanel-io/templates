import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `SQLITE_DATABASE=/var/www/html/data/database/poznote.db`,
        `POZNOTE_USERNAME=${input.username}`,
        `POZNOTE_PASSWORD=${input.password}`,
        `HTTP_WEB_PORT=80`,
      ].join("\n"),
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
          name: "data",
          mountPath: "/var/www/html/data",
        },
      ],
    },
  });

  return { services };
}
