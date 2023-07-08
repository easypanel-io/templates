import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [`BASE_URL=https://$(PRIMARY_DOMAIN)`].join("\n"),
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
          name: "cache",
          mountPath: "/var/cache/ntfy",
        },
        {
          type: "volume",
          name: "etc",
          mountPath: "/etc/ntfy",
        },
      ],
      deploy: {
        command: "ntfy serve",
      },
    },
  });

  return { services };
}
