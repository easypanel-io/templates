import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 4848 }],
      env: [
        `AB_DATA_PATH=/config`,
        `AB_LOG_LEVEL=INFO`,
        `PUID=1000`,
        `PGID=1000`,
        `UMASK=022`,
      ].join("\n"),
      mounts: [{ type: "volume", name: "config", mountPath: "/config" }],
    },
  });

  return { services };
}
