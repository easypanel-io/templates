import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `DB_USER=postgres`,
        `DB_PASSWORD=${databasePassword}`,
        `DB_DATABASE=$(PROJECT_NAME)`,
        `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "xwiki",
          mountPath: "/usr/local/xwiki",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-db`,
      source: {
        type: "image",
        image: input.databaseServiceImage,
      },
      env: [
        `POSTGRES_ROOT_PASSWORD=${databasePassword}`,
        `POSTGRES_PASSWORD=${databasePassword}`,
        `POSTGRES_USER=postgres`,
        `POSTGRES_DB=$(PROJECT_NAME)`,
        `POSTGRES_INITDB_ARGS=--encoding=UTF8 --locale-provider=builtin --locale=C.UTF-8`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "xwiki-db",
          mountPath: "/var/lib/postgresql/data",
        },
      ],
    },
  });

  return { services };
}
