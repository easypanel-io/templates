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
          port: 5030,
        },
      ],
      ports: [
        {
          published: Number(input.torrentPort),
          target: 5031,
          protocol: "tcp",
        },
        {
          published: Number(input.webPort),
          target: 50300,
          protocol: "tcp",
        },
      ],
      env: [`SLSKD_REMOTE_CONFIGURATION=true`].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/app",
        },
      ],
    },
  });

  return { services };
}
