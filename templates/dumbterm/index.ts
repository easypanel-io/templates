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
      mounts: [
        {
          type: "volume",
          name: "dumbterm-config",
          mountPath: "/root/.config",
        },
        {
          type: "volume",
          name: "dumbterm-data",
          mountPath: "/root/data",
        },
      ],
      env: [
        `TZ=Etc/UTC`,
        `SITE_TITLE=DUMBTERM`,
        `DUMBTERM_PIN=`,
        `BASE_URL=https://$(PRIMARY_DOMAIN)`,
        `ENABLE_STARSHIP=`,
        `LOCKOUT_TIME=`,
        `MAX_SESSION_AGE=`,
        `ALLOWED_ORIGINS=*`,
      ].join("\n"),
    },
  });

  return { services };
}
