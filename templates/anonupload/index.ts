import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `ADMIN_EMAIL=${input.appEmail}`,
        `ADMIN_PASSWORD=${input.appPassword}`,
        `APP_FILELIST=jpeg,jpg,gif,png,zip,xls,doc,mp3,mp4,mpeg,wav,avi,rar,7z,txt`,
        `APP_SIZE_VERIFICATION=true`,
        `APP_FILE_DESTINATION=files`,
        `APP_BASE_URL=https://$(PRIMARY_DOMAIN)`,
        `APP_MAX_SIZE=10000000000`,
        `APP_MIN_SIZE=0`,
        `APP_CONTACT_EMAIL=${input.appContactEmail}`,
        `APP_DOWNLOAD_TIME=30`,
      ].join("\n"),
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
          name: "files",
          mountPath: "/var/www/html/files",
        },
      ],
    },
  });

  return { services };
}
