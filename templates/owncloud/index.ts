import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();
  const appEnv = [];

  if (input.databaseType === "mariadb") {
    appEnv.push(
      `OWNCLOUD_DB_TYPE=mysql`,
      `OWNCLOUD_DB_NAME=${input.projectName}`,
      `OWNCLOUD_DB_USERNAME=mariadb`,
      `OWNCLOUD_DB_PASSWORD=${databasePassword}`,
      `OWNCLOUD_DB_HOST=${input.projectName}_${input.databaseServiceName}`,
      `OWNCLOUD_MYSQL_UTF8MB4=true`,
      `OWNCLOUD_DOMAIN=https://${input.domain}`,
      `OWNCLOUD_TRUSTED_DOMAINS=${input.domain}`,
      `OWNCLOUD_TRUSTED_PROXIES=0.0.0.0/0`,
      `OWNCLOUD_REDIS_ENABLED=true`,
      `OWNCLOUD_REDIS_HOST=${input.projectName}_${input.redisServiceName}`,
      `OWNCLOUD_REDIS_PASSWORD=${redisPassword}`,
      `OWNCLOUD_ADMIN_USERNAME=${input.adminUsername}`,
      `OWNCLOUD_ADMIN_PASSWORD=${input.adminPassword}`,
    );

    services.push({
      type: "mariadb",
      data: {
        projectName: input.projectName,
        serviceName: input.databaseServiceName,
        password: databasePassword,
      },
    });
  }

  if (input.databaseType === "postgres") {
    appEnv.push(
      `OWNCLOUD_DB_TYPE=pgsql`,
      `OWNCLOUD_DB_NAME=${input.projectName}`,
      `OWNCLOUD_DB_USERNAME=postgres`,
      `OWNCLOUD_DB_PASSWORD=${databasePassword}`,
      `OWNCLOUD_DB_HOST=${input.projectName}_${input.databaseServiceName}`,
      `OWNCLOUD_DOMAIN=https://${input.domain}`,
      `OWNCLOUD_TRUSTED_DOMAINS=${input.domain}`,
      `OWNCLOUD_TRUSTED_PROXIES=0.0.0.0/0`,
      `OWNCLOUD_REDIS_ENABLED=true`,
      `OWNCLOUD_REDIS_HOST=${input.projectName}_${input.redisServiceName}`,
      `OWNCLOUD_REDIS_PASSWORD=${redisPassword}`,
      `OWNCLOUD_ADMIN_USERNAME=${input.adminUsername}`,
      `OWNCLOUD_ADMIN_PASSWORD=${input.adminPassword}`,
    );

    services.push({
      type: "postgres",
      data: {
        projectName: input.projectName,
        serviceName: input.databaseServiceName,
        password: databasePassword,
      },
    });
  }

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: appEnv.join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 8080,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/mnt/data",
        },
      ],
    },
  });

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
