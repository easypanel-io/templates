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
        image: input.appServiceImage,
      },
      env: `BASEROW_PUBLIC_URL=https://$(PRIMARY_DOMAIN)`,
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [{ type: "volume", name: "data", mountPath: "/baserow/data" }],
    },
  });

  return { services };
}
