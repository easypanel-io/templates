import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secretKey = randomString(64);

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
          port: 7574,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "app-data",
          mountPath: "/appdata",
        },
      ],
      env: [
        `SECRET_ENCRYPTION_KEY=${secretKey}`,
        `TZ=${input.timezone}`,
        `PORT=7574`,
      ].join("\n"),
    },
  });

  return { services };
}
