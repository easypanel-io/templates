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
          port: 3001,
        },
      ],
      env: [
        `DASHDOT_SHOW_HOST=false`,
        `DASHDOT_SHOW_DASH_VERSION=true`,
        `DASHDOT_ENABLE_CPU_TEMPS=false`,
        `DASHDOT_USE_IMPERIAL=false`,
        `DASHDOT_ALWAYS_SHOW_PERCENTAGES=false`,
        `DASHDOT_PAGE_TITLE=dashdot`,
        `DASHDOT_ACCEPT_OOKLA_EULA=true`,
      ].join("\n"),
    },
  });

  return { services };
}
