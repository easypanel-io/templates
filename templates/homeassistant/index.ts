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
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/config",
        },
        {
          type: "file",
          content: [
            "default_config:",
            "",
            "frontend:",
            "  themes: !include_dir_merge_named themes",
            "",
            "http:",
            "  use_x_forwarded_for: true",
            "  trusted_proxies:",
            "    - 10.0.0.0/8",
            "",
          ].join("\n"),
          mountPath: "/config/configuration.yaml",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8123,
        },
      ],
    },
  });

  return { services };
}
