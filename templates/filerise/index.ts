import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const persistentTokensKey = randomString(32);

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
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "filerise-uploads",
          mountPath: "/var/www/uploads",
        },
        {
          type: "volume",
          name: "filerise-users",
          mountPath: "/var/www/users",
        },
        {
          type: "volume",
          name: "filerise-metadata",
          mountPath: "/var/www/metadata",
        },
      ],
      env: [
        `TIMEZONE=UTC`,
        `TOTAL_UPLOAD_SIZE=${input.totalUploadSize}`,
        `SECURE=false`,
        `PERSISTENT_TOKENS_KEY=${persistentTokensKey}`,
      ].join("\n"),
    },
  });

  return { services };
}
