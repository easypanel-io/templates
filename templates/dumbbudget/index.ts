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
        `DUMBBUDGET_PIN=`,
        `BASE_URL=https://$(PRIMARY_DOMAIN)`,
        `CURRENCY=USD`,
        `INSTANCE_NAME=My Account`,
      ].join("\n"),
    },
  });

  return { services };
}
