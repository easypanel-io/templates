import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: "lscr.io/linuxserver/nzbget:latest",
      },
      env: [
        `NZBGET_USER=${input.username}`,
        `NZBGET_PASS=${input.password}`,
        `TZ=${input.serviceTimezone}`,
      ].join("\n"),
      proxy: {
        port: 6789,
        secure: true,
      },
      domains: [{ name: input.domain }],
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
        },
        {
          type: "volume",
          name: "downloads",
          mountPath: "/downloads",
        },
      ],
    },
  });

  return { services };
}
