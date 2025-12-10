import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `ND_SCANSCHEDULE=1h`,
        `ND_LOGLEVEL=info`,
        `ND_SESSIONTIMEOUT=24h`,
        `ND_ENABLEGRAVATAR=true`,
        `ND_ENABLESHARING=true`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 4533,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
        {
          type: "volume",
          name: "music",
          mountPath: "/music",
        },
      ],
    },
  });

  return { services };
}
