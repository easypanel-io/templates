import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secretKey = randomPassword();

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
      env: [
        `NOTES_PATH=/nanote/notes`,
        `UPLOAD_PATH=/nanote/uploads`,
        `CONFIG_PATH=/nanote/config`,
        `SECRET_KEY=${secretKey}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/nanote",
        },
      ],
    },
  });

  return { services };
}
