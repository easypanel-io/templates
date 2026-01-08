import { Output, Services, randomString } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const jwtSecret = randomString(32);

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
        "SECRET_LOCAL_HOSTNAME=0.0.0.0",
        "SECRET_PORT=3000",
        `SECRET_HOST=https://$(PRIMARY_DOMAIN)`,
        `SECRET_ROOT_USER=${input.rootUser}`,
        `SECRET_ROOT_PASSWORD=${input.rootPassword}`,
        `SECRET_ROOT_EMAIL=${input.rootEmail}`,
        `SECRET_FILE_SIZE=${input.fileSize}`,
        `SECRET_FORCED_LANGUAGE=${input.forcedLanguage}`,
        `SECRET_JWT_SECRET=${jwtSecret}`,
        `SECRET_MAX_TEXT_SIZE=${input.maxTextSize}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "hemmelig-files",
          mountPath: "/var/tmp/hemmelig/upload/files",
        },
        {
          type: "volume",
          name: "hemmelig-database",
          mountPath: "/home/node/hemmelig/database",
        },
      ],
    },
  });

  return { services };
}
