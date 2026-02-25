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
          port: 7745,
        },
      ],
      env: [
        `HBOX_LOG_LEVEL=info`,
        `HBOX_LOG_FORMAT=text`,
        `HBOX_WEB_MAX_UPLOAD_SIZE=10`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: `homebox-data`,
          mountPath: "/data/",
        },
      ],
    },
  });

  return { services };
}
