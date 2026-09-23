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
        `dbtype=sqlite`,
        `timezone=${input.timezone}`,
        `externalurl=https://$(PRIMARY_DOMAIN)`,
        `generateinvite=true`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "files",
          mountPath: "/app/files",
        },
        {
          type: "volume",
          name: "images",
          mountPath: "/app/images",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
    },
  });

  return { services };
}
