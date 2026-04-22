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
          port: 3280,
        },
      ],
      env: [
        `ORIGIN=https://$(PRIMARY_DOMAIN)`,
        `TOKEN_TIME=${input.tokenTime || "72"}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "uploads",
          mountPath: "/usr/src/app/uploads",
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/usr/src/app/data",
        },
      ],
    },
  });

  return { services };
}
