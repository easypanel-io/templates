import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const authPassword = input.authPassword ?? randomPassword();

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
      env: [
        `AUTH_USERNAME=${input.authUsername}`,
        `AUTH_PASSWORD=${authPassword}`,
        `PUID=1000`,
        `PGID=1000`,
        `TZ=UTC`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "posters",
          mountPath: "/config/posters",
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/config/data",
        },
      ],
    },
  });

  return { services };
}
