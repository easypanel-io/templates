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
        image: "ksjaay/lunalytics:0.10.23",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 2308,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/app/data",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/app/logs",
        },
      ],
    },
  });

  return { services };
}
