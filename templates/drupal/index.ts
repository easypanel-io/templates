import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

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
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "modules",
          mountPath: "/var/www/html/modules",
        },
        {
          type: "volume",
          name: "profiles",
          mountPath: "/var/www/html/profiles",
        },
        {
          type: "volume",
          name: "themes",
          mountPath: "/var/www/html/themes",
        },
        {
          type: "volume",
          name: "sites",
          mountPath: "/var/www/html/sites",
        },
      ],
      ports: [],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  return { services };
}
