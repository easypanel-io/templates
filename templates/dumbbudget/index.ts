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
          name: "dumbbudget-data",
          mountPath: "/app/data",
        },
      ],
      env: [
        `DUMBBUDGET_PIN=${input.dumbbudgetPin}`,
        `BASE_URL=https://$(PRIMARY_DOMAIN)`,
        `CURRENCY=${input.currency}`,
        `SITE_TITLE=${input.siteTitle}`,
        `INSTANCE_NAME=${input.instanceName}`,
      ].join("\n"),
    },
  });

  return { services };
}
