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
          host: "web-$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 29418,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "git_volume",
          mountPath: "/var/gerrit/git",
        },
        {
          type: "volume",
          name: "index_volume",
          mountPath: "/var/gerrit/index",
        },
        {
          type: "volume",
          name: "cache_volume",
          mountPath: "/var/gerrit/cache",
        },
      ],
    },
  });

  return { services };
}
