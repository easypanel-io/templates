import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const configToml = `[[aws]]
name="staging"
source="CREDENTIALS_FILE"
path="/etc/config/credentials.yaml"
profile="production"

[sqlite]
  file = "komiser.db"
  `;

  const credentialFile = `

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
        {
          type: "file",
          content: credentialFile,
          mountPath: "/etc/config/credentials.yaml",
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
