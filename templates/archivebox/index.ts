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
        `ALLOWED_HOSTS=*`,
        `CSRF_TRUSTED_ORIGINS=https://$(PRIMARY_DOMAIN)`,
        `PUBLIC_INDEX=True`,
        `PUBLIC_SNAPSHOTS=True`,
        `PUBLIC_ADD_VIEW=False`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
    },
  });

  return { services };
}
