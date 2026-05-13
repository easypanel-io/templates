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
      env: [
        `NODE_ENV=production`,
        `TCD_ENABLE_FILES_API=0`,
        `TCD_EXPOSE_LOGS_TO_PUBLIC=0`,
        `TCD_MIGRATE_OLD_VOD_JSON=0`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/usr/local/share/twitchautomator/data",
        },
      ],
    },
  });

  return { services };
} 