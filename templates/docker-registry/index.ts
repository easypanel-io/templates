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
          port: 5000,
        },
      ],
      mounts: [
        { type: "volume", name: "data", mountPath: "/var/lib/registry" },
      ],
      deploy: {
        zeroDowntime: true,
      },
      basicAuth: [{ username: input.user, password: input.password }],
    },
  });

  return { services };
}
