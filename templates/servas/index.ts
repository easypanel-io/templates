import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mariadbPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `APP_NAME=Servas`,
        `APP_URL=https://$(PRIMARY_DOMAIN)`,
        `APP_ENV=production`,
        `APP_DEBUG=false`,
        `APP_KEY=base64:${btoa(randomString(32))}`,
        `SERVAS_ENABLE_REGISTRATION=true`,
        `DB_CONNECTION=mysql`,
        `DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `DB_PORT=3306`,
        `DB_USERNAME=mariadb`,
        `DB_PASSWORD=${mariadbPassword}`,
        `DB_DATABASE=$(PROJECT_NAME)`,
      ].join("\n"),
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
      deploy: {
        command: `until php -r "exit(@fsockopen(getenv('DB_HOST'), (int) getenv('DB_PORT')) ? 0 : 1);"; do echo "waiting for database"; sleep 2; done; exec /docker-entrypoint.sh`,
      },
      mounts: [
        {
          type: "file",
          content: "[client]\nskip-ssl\n",
          mountPath: "/etc/my.cnf.d/client-ssl.cnf",
        },
      ],
    },
  });

  services.push({
    type: `mariadb`,
    data: {
      serviceName: input.databaseServiceName,
      image: "mariadb:10.7.3",
      password: mariadbPassword,
    },
  });

  return { services };
}
