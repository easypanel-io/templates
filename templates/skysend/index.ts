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
          port: 3000,
        },
      ],
      env: [
        `BASE_URL=https://$(PRIMARY_DOMAIN)`,
        `TRUST_PROXY=true`,
        `FILE_MAX_SIZE=${input.fileMaxSize}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
        {
          type: "volume",
          name: "uploads",
          mountPath: "/uploads",
        },
      ],
    },
  });

  return { services };
}
