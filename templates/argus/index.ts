import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const configYml = `settings:
  data:
    database-file: /data/argus.db
service: {}
`;

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
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "file",
          content: configYml,
          mountPath: "/config/config.yml",
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
      env: [`ARGUS_CONFIG_FILE=/config/config.yml`].join("\n"),
    },
  });

  return { services };
}
