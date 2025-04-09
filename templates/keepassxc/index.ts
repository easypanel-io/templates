import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  // KeePassXC Service
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
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3001,
        },
      ],
      env: [
        `PUID=${input.appPUID}`,
        `PGID=${input.appPGID}`,
        `TZ=${input.appTZ}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
        },
      ],
      securityOpt: ["seccomp:unconfined"],
    },
  });

  return { services };
}
