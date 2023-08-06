import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const appKey = randomString(48);
  const appSecret = randomString(48);
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();
  const adminPassword = input.adminPassword ?? randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `KEY=${appKey}`,
        `SECRET=${appSecret}`,
        `DB_CLIENT=${
          input.databaseType === "postgres" || input.databaseType === "postgis"
            ? "pg"
            : "mysql"
        }`,
        `DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `DB_PORT=${
          input.databaseType === "postgres" || input.databaseType === "postgis"
            ? "5432"
            : "3306"
        }`,
        `DB_DATABASE=$(PROJECT_NAME)`,
        `DB_USER=${input.databaseType}`,
        `DB_PASSWORD=${databasePassword}`,
        `CACHE_ENABLED=true`,
        `CACHE_STORE=redis`,
        `REDIS_HOST=$(PROJECT_NAME)_${input.redisServiceName}`,
        `REDIS_PASSWORD=${redisPassword}`,
        `ADMIN_EMAIL=${input.adminEmail}`,
        `ADMIN_PASSWORD=${adminPassword}`,
        `PUBLIC_URL=https://$(PRIMARY_DOMAIN)`,
      ].join("\n"),
      source: { type: "image", image: input.appServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 8055 }],
      mounts: [
        {
          type: "volume",
          name: "uploads",
          mountPath: "/directus/uploads",
        },
        {
          type: "volume",
          name: "extensions",
          mountPath: "/directus/extensions",
        },
      ],
    },
  });

  if (input.databaseType === "postgis") {
    services.push({
      type: "app",
      data: {
        projectName: input.projectName,
        serviceName: input.databaseServiceName,
        source: { type: "image", image: "postgis/postgis:15-master" },
        env: [
          `POSTGRES_USER=${input.databaseType}`,
          `POSTGRES_PASSWORD=${databasePassword}`,
          `POSTGRES_DB=$(PROJECT_NAME)`,
        ].join("\n"),
        mounts: [
          {
            type: "volume",
            name: "data",
            mountPath: "/var/lib/postgresql/data",
          },
        ],
      },
    });
  } else {
    services.push({
      type: input.databaseType,
      data: {
        projectName: input.projectName,
        serviceName: input.databaseServiceName,
        password: databasePassword,
        command:
          input.databaseType === "mysql"
            ? "docker-entrypoint.sh --default-authentication-plugin=mysql_native_password"
            : "",
      },
    });
  }

  services.push({
    type: "redis",
    data: {
      projectName: input.projectName,
      serviceName: input.redisServiceName,
      password: redisPassword,
    },
  });

  return { services };
}
