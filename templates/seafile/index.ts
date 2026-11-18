import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const dbPassword = randomPassword();
  const jwtPrivateKey = randomString(40);

  services.push({
    type: "mariadb",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: dbPassword,
      rootPassword: dbPassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-memcached`,
      source: {
        type: "image",
        image: "memcached:1.6.18",
      },
      deploy: {
        command: "memcached -m 256",
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage ?? "seafileltd/seafile-mc:13.0.19",
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
          name: "seafile-data",
          mountPath: "/shared",
        },
      ],
      env: [
        `SEAFILE_MYSQL_DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `SEAFILE_MYSQL_DB_PORT=3306`,
        `SEAFILE_MYSQL_DB_USER=seafile`,
        `SEAFILE_MYSQL_DB_PASSWORD=${dbPassword}`,
        `INIT_SEAFILE_MYSQL_ROOT_PASSWORD=${dbPassword}`,
        `SEAFILE_MYSQL_DB_CCNET_DB_NAME=ccnet_db`,
        `SEAFILE_MYSQL_DB_SEAFILE_DB_NAME=seafile_db`,
        `SEAFILE_MYSQL_DB_SEAHUB_DB_NAME=seahub_db`,
        `TIME_ZONE=Etc/UTC`,
        `INIT_SEAFILE_ADMIN_EMAIL=me@example.com`,
        `INIT_SEAFILE_ADMIN_PASSWORD=asecret`,
        `SEAFILE_SERVER_HOSTNAME=$(PRIMARY_DOMAIN)`,
        `SEAFILE_SERVER_PROTOCOL=https`,
        `JWT_PRIVATE_KEY=${jwtPrivateKey}`,
        `CACHE_PROVIDER=memcached`,
        `MEMCACHED_HOST=$(PROJECT_NAME)_${input.appServiceName}-memcached`,
        `MEMCACHED_PORT=11211`,
        `ENABLE_SEADOC=false`,
        `ENABLE_NOTIFICATION_SERVER=false`,
      ].join("\n"),
    },
  });

  return { services };
}
