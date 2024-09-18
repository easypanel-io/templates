import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();
  const appEnv = [
    `OWNCLOUD_DOMAIN=https://$(PRIMARY_DOMAIN)`,
    `OWNCLOUD_TRUSTED_DOMAINS=$(PRIMARY_DOMAIN)`,
    `OWNCLOUD_TRUSTED_PROXIES=0.0.0.0/0`,
    `OWNCLOUD_REDIS_ENABLED=true`,
    `OWNCLOUD_REDIS_HOST=$(PROJECT_NAME)_${input.redisServiceName}`,
    `OWNCLOUD_REDIS_PASSWORD=${redisPassword}`,
    `OWNCLOUD_ADMIN_USERNAME=${input.adminUsername}`,
    `OWNCLOUD_ADMIN_PASSWORD=${input.adminPassword}`,
  ];

  if (input.databaseType === "mariadb") {
    appEnv.push(
      `OWNCLOUD_DB_TYPE=mysql`,
      `OWNCLOUD_DB_NAME=$(PROJECT_NAME)`,
      `OWNCLOUD_DB_USERNAME=mariadb`,
      `OWNCLOUD_DB_PASSWORD=${databasePassword}`,
      `OWNCLOUD_DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
      `OWNCLOUD_MYSQL_UTF8MB4=true`
    );

    services.push({
      type: "mariadb",
      data: {
        serviceName: input.databaseServiceName,
        password: databasePassword,
      },
    });
  }

  if (input.databaseType === "postgres") {
    appEnv.push(
      `OWNCLOUD_DB_TYPE=pgsql`,
      `OWNCLOUD_DB_NAME=$(PROJECT_NAME)`,
      `OWNCLOUD_DB_USERNAME=postgres`,
      `OWNCLOUD_DB_PASSWORD=${databasePassword}`,
      `OWNCLOUD_DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`
    );

    services.push({
      type: "postgres",
      data: {
        serviceName: input.databaseServiceName,
        password: databasePassword,
      },
    });
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: appEnv.join("\n"),
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
          name: "data",
          mountPath: "/mnt/data",
        },
      ],
    },
  });

  services.push({
    type: "redis",
    data: { serviceName: input.redisServiceName, password: redisPassword },
  });

  return { services };
}
