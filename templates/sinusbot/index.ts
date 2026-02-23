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
      env: [`UID=1000`, `GID=1000`, `OVERRIDE_PASSWORD=${input.password}`].join(
        "\n"
      ),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8087,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "scripts",
          mountPath: "/opt/sinusbot/scripts",
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/opt/sinusbot/data",
        },
      ],
    },
  });

  return { services };
}
