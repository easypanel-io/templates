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
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "pixapop-config",
          mountPath: "/config",
        },
        {
          type: "volume",
          name: "pixapop-photos",
          mountPath: "/photos",
        },
      ],
      env: [
        `PUID=1000`,
        `PGID=1000`,
        `TZ=Asia/Karachi`,
        `APP_USERNAME=${input.appUsername}`,
        `APP_PASSWORD=${input.appPassword}`,
      ].join("\n"),
    },
  });

  return { services };
}

