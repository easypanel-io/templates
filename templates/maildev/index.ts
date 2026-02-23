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
        `TZ=Asia/Shanghai`,
        `MAILDEV_WEB_PORT=1080`,
        `MAILDEV_SMTP_PORT=1025`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 1080,
        },
        {
          host: "smtp-$(EASYPANEL_DOMAIN)",
          port: 1025,
        },
      ],
    },
  });

  return { services };
}
