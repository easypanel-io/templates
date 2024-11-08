import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [`APP_HOME_URL=https://$(PRIMARY_DOMAIN)`].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8484,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/persist",
        },
      ],
    },
  });

  return { services };
}
