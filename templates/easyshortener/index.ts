import { Output, randomPassword, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mariadbPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `APP_NAME=Easyshortener`,
        `APP_URL=https://${input.domain}`,
        `ASSET_URL=https://${input.domain}`,
        `APP_ENV=production`,
        `APP_DEBUG=false`,
        `APP_KEY=base64:${btoa(randomString(32))}`,
        `FORCE_HTTPS=true`
        `EASYSHORTENER_ALLOW_REGISTRATION=true`,
        `EASYSHORTENER_INSALLATION_ENV=easypanel`,
        `EASYSHORTENER_ALLOW_ANALYTICS=true`,
        `DB_CONNECTION=mysql`,
        `DB_HOST=${input.projectName}_${input.databaseServiceName}`,
        `DB_PORT=3306`,
        `DB_USERNAME=mariadb`,
        `DB_PASSWORD=${mariadbPassword}`,
        `DB_DATABASE=${input.projectName}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 80,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/var/www/html",
        },
      ],
      domains: [
        {
          name: input.domain,
        },
      ],
    },
  });

  services.push({
    type: `mariadb`,
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      image: "mariadb:10.7.3",
      password: mariadbPassword,
    },
  });

  return { services };
}
