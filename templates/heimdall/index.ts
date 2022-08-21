import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [`PUID=1000`, `PGID=1000`, `TZ=${input.serviceTimezone}`].join("\n"),
      source: {
        type: "image",
        image: "lscr.io/linuxserver/heimdall:latest",
      },
      proxy: {
        port: 80,
        secure: true,
      },
      domains: [{ name: input.domain }],
      mounts: [
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
