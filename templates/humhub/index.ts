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
        `SERVER_NAME=http://$(PRIMARY_DOMAIN)`,
        `HUMHUB_CONFIG__COMPONENTS__DB__DSN=mysql:host=$(PROJECT_NAME)_${input.databaseServiceName};dbname=$(PROJECT_NAME)`,
        `HUMHUB_CONFIG__COMPONENTS__DB__USERNAME=mariadb`,
        `HUMHUB_CONFIG__COMPONENTS__DB__PASSWORD=${dbPassword}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
    },
  });

  services.push({
    type: "mariadb",
    data: {
      serviceName: input.databaseServiceName,
      password: dbPassword,
    },
  });

  return { services };
}
