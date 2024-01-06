import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: { type: "image", image: "ghcr.io/azuracast/azuracast:"+input.appServiceVersion },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 443,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "station_data",
          mountPath: "/var/azuracast/stations",
        },
        {
          type: "volume",
          name: "backups",
          mountPath: "/var/azuracast/backups",
        },
        {
          type: "volume",
          name: "db_data",
          mountPath: "/var/lib/mysql",
        },
        {
          type: "volume",
          name: "storage",
          mountPath: "/var/azuracast/storage",
        }
      ],
    },
  });

  return { services };
}
