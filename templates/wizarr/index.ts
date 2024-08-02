import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `APP_URL=https://$(PRIMARY_DOMAIN)`,
        `TZ=utc`,
        `DISABLE_BUILTIN_AUTH=false`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5690,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data/database",
        },
      ],
    },
  });

  return { services };
}
