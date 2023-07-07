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
        `DB_HOST=${input.projectName}_${input.databaseServiceName}`,
        `DB_PORT=${
          input.databaseType === "postgres" || input.databaseType === "postgis"
            ? "5432"
            : "3306"
        }`,
        `DB_DATABASE=${input.projectName}`,
        `DB_USER=${input.databaseType}`,
        `DB_PASSWORD=${databasePassword}`,
        `CACHE_ENABLED=true`,
        `CACHE_STORE=redis`,
        `REDIS_HOST=${input.projectName}_${input.redisServiceName}`,
        `REDIS_PASSWORD=${redisPassword}`,
        `ADMIN_EMAIL=${input.adminEmail}`,
        `ADMIN_PASSWORD=${adminPassword}`,
      ].join("\n"),
      source: { type: "image", image: input.appServiceImage },
      proxy: { port: 8055, secure: true },
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

  if (input.databaseType === "postgis" || input.databaseType === "mysql") {
    const appEnv = [];
    if (input.databaseType === "postgis") {
      appEnv.push(
        `POSTGRES_USER=${input.databaseType}`,
        `POSTGRES_PASSWORD=${databasePassword}`,
        `POSTGRES_DB=${input.projectName}`
      );
    } else {
      appEnv.push(
        `MYSQL_ROOT_PASSWORD=${randomPassword()}`,
        `MYSQL_USER=${input.databaseType}`,
        `MYSQL_PASSWORD=${databasePassword}`,
        `MYSQL_DATABASE=${input.projectName}`
      );
    }
    services.push({
      type: "app",
      data: {
        projectName: input.projectName,
        serviceName: input.databaseServiceName,
        source: {
          type: "image",
          image:
            input.databaseType === "postgis"
              ? "postgis/postgis:15-master"
              : "mysql:8",
        },
        env: appEnv.join("\n"),
        mounts: [
          {
            type: "volume",
            name: "data",
            mountPath: `/var/lib/${
              input.databaseType === "postgis" ? "postgresql/data" : "mysql"
            }`,
          },
        ],
        deploy: {
          command:
            input.databaseType === "postgis"
              ? ""
              : "docker-entrypoint.sh --default-authentication-plugin=mysql_native_password",
        },
      },
    });
  } else {
    services.push({
      type: input.databaseType,
      data: {
        projectName: input.projectName,
        serviceName: input.databaseServiceName,
        password: databasePassword,
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
