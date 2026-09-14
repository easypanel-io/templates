import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mongoPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `DOCKER=true`,
        `MONGODB_URL=mongodb://mongo:${mongoPassword}@$(PROJECT_NAME)_${input.appServiceName}-mongo:27017/$(PROJECT_NAME)?authSource=admin`,
        `DB_TYPE=fs`,
        `FS_DIRECTORY=/data/`,
        `TEMP_DIRECTORY=/temp/`,
        `KEY=${randomString(32)}`,
        `PASSWORD_ACCESS=${randomString(32)}`,
        `PASSWORD_REFRESH=${randomString(32)}`,
        `PASSWORD_COOKIE=${randomString(32)}`,
        `VIDEO_THUMBNAILS_ENABLED=true`,
        `TEMP_VIDEO_THUMBNAIL_LIMIT=5000000000`,
        `SECURE_COOKIES=true`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
        {
          type: "volume",
          name: "temp",
          mountPath: "/temp",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
    },
  });

  services.push({
    type: "mongo",
    data: {
      serviceName: `${input.appServiceName}-mongo`,
      password: mongoPassword,
    },
  });

  return { services };
}
