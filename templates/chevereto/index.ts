import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `CHEVERETO_DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-mysql`,
        `CHEVERETO_DB_USER=mysql`,
        `CHEVERETO_DB_PASS=${databasePassword}`,
        `CHEVERETO_DB_PORT=3306`,
        `CHEVERETO_DB_NAME=$(PROJECT_NAME)`,
        `CHEVERETO_HOSTNAME=$(PRIMARY_DOMAIN)`,
        `CHEVERETO_HOSTNAME_PATH=/`,
        `CHEVERETO_HTTPS=0`,
        `CHEVERETO_MAX_POST_SIZE=2G`,
        `CHEVERETO_MAX_UPLOAD_SIZE=2G`,
        `#CHEVERETO_SERVICING=server # uncomment to enable application filesystem upgrades`,
      ].join("\n"),
      source: { type: "image", image: input.appServiceImage },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "storage",
          mountPath: "/var/www/html/images/",
        },
      ],
    },
  });

  services.push({
    type: "mysql",
    data: {
      serviceName: `${input.appServiceName}-mysql`,
      password: databasePassword,
    },
  });

  return { services };
}
