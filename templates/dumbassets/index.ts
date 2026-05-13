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
          name: "dumbassets-data",
          mountPath: "/app/data",
        },
      ],
      env: [
        `PORT=3000`,
        `NODE_ENV=production`,
        `DEBUG=false`,
        `SITE_TITLE=DumbAssets`,
        `BASE_URL=https://$(PRIMARY_DOMAIN)`,
        `DUMBASSETS_PIN=`,
        `ALLOWED_ORIGINS=*`,
        `APPRISE_URL=`,
      ].join("\n"),
    },
  });

  return { services };
}
