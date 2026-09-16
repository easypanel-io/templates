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
          port: 8081,
        },
      ],
      env: [
        `TZ=${input.timezone || "UTC"}`,
        "PUID=0",
        "PGID=0",
        "REDIS_HOST=disabled",
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
        {
          type: "volume",
          name: "cache",
          mountPath: "/home/borg/.cache/borg",
        },
        {
          type: "bind",
          hostPath: input.localPath || "/",
          mountPath: "/local",
        },
      ],
    },
  });

  return { services };
}
