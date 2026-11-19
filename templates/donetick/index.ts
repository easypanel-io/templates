import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const jwtSecret = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `DT_ENV=selfhosted`,
        `DT_SQLITE_PATH=/donetick-data/donetick.db`,
        `DT_JWT_SECRET=${jwtSecret}`,
        `TZ=${input.timezone || "Etc/UTC"}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 2021,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/donetick-data",
        },
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
        },
      ],
    },
  });

  return { services };
}
