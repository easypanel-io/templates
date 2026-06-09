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
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-web`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `DB_CONNECTION=mysql`,
        `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `DB_PORT=3306`,
        `DB_DATABASE=$(PROJECT_NAME)`,
        `DB_USERNAME=mariadb`,
        `DB_PASSWORD=${dbPassword}`,
        `APP_URL=https://$(EASYPANEL_DOMAIN)`,
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
          name: "photos",
          mountPath: "/var/www/resources/photos",
        },
        {
          type: "volume",
          name: "app-storage",
          mountPath: "/var/www/storage/app",
        },
      ],
    },
  });

  return { services };
}
