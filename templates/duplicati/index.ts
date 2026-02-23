import { Output, Services, randomString } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const encryptionKey = randomString(32);

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
          port: 8200,
        },
      ],
      env: [
        `TZ=Europe/London`,
        `SETTINGS_ENCRYPTION_KEY=${encryptionKey}`,
        `DUPLICATI__WEBSERVICE_PASSWORD=${input.appPassword}`,
      ].join("\n"),
      mounts: [
        {
          type: "bind",
          hostPath: "/",
          mountPath: "/host",
        },
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
        },
      ],
    },
  });

  return { services };
}
