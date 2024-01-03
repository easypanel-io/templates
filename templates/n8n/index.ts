import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: ["WEBHOOK_URL=https://$(EASYPANEL_DOMAIN)"].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5678,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/home/node/.n8n",
        },
      ],
    },
  });

  return { services };
}
