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
          port: 3000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "dumbpad-data",
          mountPath: "/app/data",
        },
      ],
      env: [
        `SITE_TITLE=DumbPad`,
        `DUMBPAD_PIN=`,
        `BASE_URL=https://$(PRIMARY_DOMAIN)`,
      ].join("\n"),
    },
  });

  return { services };
}
