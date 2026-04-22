import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `BYTEBIN_MISC_KEYLENGTH=${input.keyLength}`,
        `BYTEBIN_CONTENT_MAXSIZE=${input.maxContentSize}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/opt/bytebin/content",
        },
        {
          type: "volume",
          name: "db",
          mountPath: "/opt/bytebin/db",
        },
      ],
    },
  });

  return { services };
}
