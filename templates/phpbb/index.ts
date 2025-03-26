import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const dbPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `PHPBB_DATABASE_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `PHPBB_DATABASE_PORT_NUMBER=3306`,
        `PHPBB_DATABASE_NAME=$(PROJECT_NAME)`,
        `PHPBB_DATABASE_USER=mariadb`,
        `PHPBB_DATABASE_PASSWORD=${dbPassword}`,
        `PHPBB_USERNAME=admin`,
        `PHPBB_PASSWORD=admin`,
        `PHPBB_EMAIL=admin@example.com`,
        `PHPBB_FORUM_NAME=My phpBB Forum`,
        `PHPBB_FORUM_DESCRIPTION=A forum powered by phpBB`,
        `PHPBB_HOST=$(PRIMARY_DOMAIN)`,
        `PHPBB_SKIP_BOOTSTRAP=no`,
        `ALLOW_EMPTY_PASSWORD=no`,
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
          name: "phpbb-data",
          mountPath: "/bitnami/phpbb",
        },
      ],
    },
  });

  services.push({
    type: "mariadb",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: dbPassword,
    },
  });

  return { services };
}
