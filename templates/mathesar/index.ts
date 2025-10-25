import {
  Output,
  Services,
  randomPassword,
  randomString,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const databasePassword = randomPassword();
  const secretKey = randomString(50);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `DJANGO_SETTINGS_MODULE=config.settings.production`,
        `ALLOWED_HOSTS=*`,
        `DEBUG=false`,
        `SECRET_KEY=${secretKey}`,
        `WEB_CONCURRENCY=3`,
        `POSTGRES_DB=$(PROJECT_NAME)`,
        `POSTGRES_USER=postgres`,
        `POSTGRES_PASSWORD=${databasePassword}`,
        `POSTGRES_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `POSTGRES_PORT=5432`,
        `FILE_STORAGE_DICT={}`,
        `OIDC_CONFIG_DICT={}`,
      ].join("\n"),
      mounts: [
        { type: "volume", name: "static", mountPath: "/code/static" },
        { type: "volume", name: "media", mountPath: "/code/media" },
        { type: "volume", name: "secrets", mountPath: "/code/.secrets" },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      image: input.databaseServiceImage,
      password: databasePassword,
    },
  });

  return { services };
}
