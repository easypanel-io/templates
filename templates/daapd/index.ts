import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [`UID=1000`, `GID=1000`].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/",
          port: 3689,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "media",
          mountPath: "/srv/media",
        },
        {
          type: "volume",
          name: "config",
          mountPath: "/etc/owntone",
        },
        {
          type: "volume",
          name: "cache",
          mountPath: "/var/cache/owntone",
        },
      ],
    },
  });

  return { services };
}
