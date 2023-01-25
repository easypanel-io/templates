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
        image: input.appServiceImage,
      },
      proxy: {
        port: 5230,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "memos",
          mountPath: "/var/opt/memos",
        },
      ],
    },
  });

  return { services };
}
