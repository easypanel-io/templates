import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secret = randomString(32);
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `SECRET_KEY=${secret}`,
        `DB_ENGINE=django.db.backends.postgresql`,
        `POSTGRES_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `POSTGRES_PORT=5432`,
        `POSTGRES_PASSWORD=${databasePassword}`,
        `POSTGRES_USER=postgres`,
        `POSTGRES_DB=$(PROJECT_NAME)`,
        `GUNICORN_MEDIA=1`,
        `DEBUG=0`,
        `ENABLE_PDF_EXPORT=1`,
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
          name: "media",
          mountPath: "/opt/recipes/mediafiles",
        },
        {
          type: "volume",
          name: "static",
          mountPath: "/opt/recipes/staticfiles",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
