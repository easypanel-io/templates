import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `HBOX_LOG_LEVEL=${input.logLevel}`,
        `HBOX_LOG_FORMAT=${input.logFormat}`,
        `HBOX_WEB_MAX_FILE_UPLOAD=${input.maxFileUpload}`,
        `HBOX_OPTIONS_ALLOW_ANALYTICS=${input.allowAnalytics}`,
      ].join("\n"),
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
