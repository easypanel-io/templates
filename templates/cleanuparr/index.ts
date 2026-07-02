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
      env: [
        `PORT=11011`,
        `BIND_ADDRESS=0.0.0.0`,
        `BASE_PATH=`,
        `TZ=Etc/UTC`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 11011,
        },
      ],
    },
  });

  return { services };
}
