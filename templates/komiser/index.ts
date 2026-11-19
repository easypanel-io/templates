import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const configToml = `[sqlite]
  file = "komiser.db"
  `;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      mounts: [
        {
          type: "file",
          content: configToml,
          mountPath: "/etc/config/config.toml",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      deploy: {
        command: "komiser start --config /etc/config/config.toml",
      },
    },
  });

  return { services };
}
