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
          port: 9000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "crontab-data",
          mountPath: "/var/spool/cron/crontabs",
        },
      ],
    },
  });

  return { services };
}
