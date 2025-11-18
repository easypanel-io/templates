import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const postgresPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `DL_ENV_TYPE=selfHosted`,
        `DL_PG_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `DL_PG_PORT=5432`,
        `DL_PG_USER=postgres`,
        `DL_PG_PASSWORD=${postgresPassword}`,
        `DL_PG_NAME=$(PROJECT_NAME)`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-updater`,
      source: {
        type: "image",
        image: "alpine:3.20",
      },
      deploy: {
        command:
          "/bin/sh -c \"apk add --no-cache curl && echo '0 3 * * * /usr/bin/curl -s -X POST http://$(PROJECT_NAME)_" +
          input.appServiceName +
          ":3000/api/domain-updater' > /etc/crontabs/root && echo '0 4 * * * /usr/bin/curl -s -X POST http://$(PROJECT_NAME)_" +
          input.appServiceName +
          ":3000/api/expiration-reminders' >> /etc/crontabs/root && crond -f -L /dev/stdout\"",
      },
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: postgresPassword,
    },
  });

  return { services };
}
