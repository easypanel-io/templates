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
      env: [`TITLE=${input.title}`, `THEME=${input.theme || "auto"}`].join(
        "\n"
      ),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 4173,
        },
      ],
      mounts: [
        {
          type: "file",
          content: input.configJson,
          mountPath: "/app/src/config/config.json",
        },
        {
          type: "volume",
          name: "icons",
          mountPath: "/app/public/icons",
        },
      ],
    },
  });

  return { services };
}
