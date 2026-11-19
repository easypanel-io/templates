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
          port: 8851,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data/ExerciseDiary",
        },
      ],
      env: [
        `TZ=${input.timezone}`,
        `THEME=${input.theme}`,
        `COLOR=${input.color}`,
      ].join("\n"),
    },
  });

  return { services };
}
