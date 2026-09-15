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
      env: [
        `SUGGESTARR_PORT=5000`,
        `LOG_LEVEL=INFO`,
        `TZ=Etc/UTC`,
        `ALLOW_REGISTRATION=false`,
        `AUTH_MODE=enabled`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/app/config/config_files",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5000,
        },
      ],
    },
  });

  return { services };
}
