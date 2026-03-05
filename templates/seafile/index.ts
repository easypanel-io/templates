import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const dbPassword = randomPassword();

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
        image: input.appServiceImage,
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
        `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `DB_ROOT_PASSWD=${dbPassword}`,
        `TIME_ZONE=Etc/UTC`,
        `SEAFILE_ADMIN_EMAIL=me@example.com`,
        `SEAFILE_ADMIN_PASSWORD=asecret`,
        `SEAFILE_SERVER_LETSENCRYPT=false`,
        `SEAFILE_SERVER_HOSTNAME=$(PRIMARY_DOMAIN)`,
      ].join("\n"),
    },
  });

  return { services };
}
