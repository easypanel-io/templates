import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [`LAVALINK_SERVER_PASSWORD=${input.password}`].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 2333,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "lavalink",
          mountPath: "/opt/Lavalink",
        },
      ],
    },
  });

  return { services };
}
