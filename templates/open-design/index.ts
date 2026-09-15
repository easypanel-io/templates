import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const apiToken = input.apiToken || randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `OD_API_TOKEN=${apiToken}`,
        `OD_BIND_HOST=0.0.0.0`,
        `OD_PORT=7456`,
        `NODE_ENV=production`,
        `OPEN_DESIGN_ALLOWED_ORIGINS=https://$(EASYPANEL_DOMAIN)`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 7456,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/app/.od",
        },
      ],
    },
  });

  return { services };
}
