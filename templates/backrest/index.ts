import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const userdata = input.backupUserdataHostPath;
  const repos = input.backupReposHostPath;

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
          port: 9898,
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
        ...(userdata
          ? [
              {
                type: "bind" as const,
                hostPath: userdata,
                mountPath: "/userdata",
              },
            ]
          : []),
        ...(repos
          ? [
              {
                type: "bind" as const,
                hostPath: repos,
                mountPath: "/repos",
              },
            ]
          : []),
      ],
      env: [
        `BACKREST_PORT=0.0.0.0:9898`,
        `BACKREST_DATA=/data`,
        `BACKREST_CONFIG=/config/config.json`,
        `XDG_CACHE_HOME=/cache`,
        `TMPDIR=/tmp`,
        `TZ=${input.timezone ?? "Etc/UTC"}`,
      ].join("\n"),
    },
  });

  return { services };
}
