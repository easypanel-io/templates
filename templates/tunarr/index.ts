import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const envVars = [`LOG_LEVEL=${input.logLevel}`, `TZ=${input.timezone}`];

  if (input.databasePath) {
    envVars.push(`TUNARR_DATABASE_PATH=${input.databasePath}`);
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: envVars.join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/config/tunarr",
        },
      ],
    },
  });

  return { services };
}
