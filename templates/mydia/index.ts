import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const secretKeyBase = randomString(64);
  const guardianSecretKey = randomString(48);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `PUID=1000`,
        `PGID=1000`,
        `TZ=${input.timezone || "America/New_York"}`,
        `SECRET_KEY_BASE=${secretKeyBase}`,
        `GUARDIAN_SECRET_KEY=${guardianSecretKey}`,
        `PHX_HOST=$(PRIMARY_DOMAIN)`,
        `PORT=4000`,
        `MOVIES_PATH=/media/library/movies`,
        `TV_PATH=/media/library/tv`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 4000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
        },
        {
          type: "volume",
          name: "media",
          mountPath: "/media",
        },
      ],
    },
  });

  return { services };
}
