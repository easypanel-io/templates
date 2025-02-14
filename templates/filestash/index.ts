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
        `APPLICATION_URL=https://$(PRIMARY_DOMAIN)`,
        `CANARY=true`,
        `OFFICE_FILESTASH_URL=http://$(PROJECT_NAME)_${input.appServiceName}:8334`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8334,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "filestash",
          mountPath: "/app/data/state/",
        },
      ],
    },
  });

  return { services };
}
