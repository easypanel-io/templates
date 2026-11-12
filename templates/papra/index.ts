import { Output, randomString, Services } from "~templates-utils";
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
        `APP_BASE_URL=https://$(PRIMARY_DOMAIN)`,
        `AUTH_SECRET=${randomString(48)}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 1221,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "app-data",
          mountPath: "/app/app-data",
        },
      ],
    },
  });

  return { services };
}
