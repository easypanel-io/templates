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
      env: [
        `CARBONE_EE_LICENSE=${input.carboneKey}`,
        `CARBONE_EE_STUDIO=true`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 4000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "template",
          mountPath: "/app/template",
        },
      ],
    },
  });

  return { services };
}
