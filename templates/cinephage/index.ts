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
      env: [`TZ=${input.timezone || "UTC"}`, `PUID=1000`, `PGID=1000`].join(
        "\n"
      ),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/app/data",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/app/logs",
        },
        {
          type: "bind",
          hostPath: input.mediaPath,
          mountPath: "/media",
        },
      ],
    },
  });

  return { services };
}
