import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `SERVER_ADMIN=${input.serverAdmin}`,
        `HTTPS_SERVER_NAME=$(PRIMARY_DOMAIN)`,
        `HTTP_SERVER_NAME=$(PRIMARY_DOMAIN)`,
        `FORCE_HTTPS=true`,
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
          name: "htdocs",
          mountPath: "/htdocs",
        },
      ],
    },
  });

  return { services };
}
