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
      env: [`TZ=${input.timezone || "Etc/UTC"}`].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3111,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "database",
          mountPath: "/app/database",
        },
      ],
    },
  });

  return { services };
}
