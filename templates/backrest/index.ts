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
      mounts: [
        {
          type: "volume",
          name: "backrest-data",
          mountPath: "/data",
        },
        {
          type: "volume",
          name: "backrest-config",
          mountPath: "/config",
        },
        {
          type: "volume",
          name: "backrest-cache",
          mountPath: "/cache",
        },
        {
          type: "volume",
          name: "backrest-tmp",
          mountPath: "/tmp",
        },
        {
          type: "volume",
          name: "backrest-rclone",
          mountPath: "/root/.config/rclone",
        },
      ],
      env: [
        `BACKREST_PORT=0.0.0.0:8080`,
        `BACKREST_DATA=/data`,
        `BACKREST_CONFIG=/config/config.json`,
        `XDG_CACHE_HOME=/cache`,
        `TMPDIR=/tmp`,
        `TZ=America/Los_Angeles`,
      ].join("\n"),
    },
  });

  return { services };
}
