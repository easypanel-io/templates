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
          name: "slink-data",
          mountPath: "/app/var/data",
        },
        {
          type: "volume",
          name: "slink-images",
          mountPath: "/app/slink/images",
        },
      ],
      env: [
        `TZ=Etc/UTC`,
        `ORIGIN=https://$(PRIMARY_DOMAIN)`,
        `USER_APPROVAL_REQUIRED=true`,
        `USER_PASSWORD_MIN_LENGTH=8`,
        `USER_PASSWORD_REQUIREMENTS=15`,
        `IMAGE_MAX_SIZE=15M`,
        `IMAGE_STRIP_EXIF_METADATA=true`,
        `IMAGE_COMPRESSION_QUALITY=80`,
        `STORAGE_PROVIDER=local`,
      ].join("\n"),
    },
  });

  return { services };
}
