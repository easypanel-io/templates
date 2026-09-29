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
      mounts: [
        {
          type: "volume",
          name: "base",
          mountPath: "/lc_base",
        },
        {
          type: "volume",
          name: "digitals",
          mountPath: "/lc_digitals",
        },
        {
          type: "volume",
          name: "uploads",
          mountPath: "/lc_uploads",
        },
        {
          type: "volume",
          name: "site",
          mountPath: "/site",
        },
      ],
    },
  });

  return { services };
}
