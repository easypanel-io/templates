import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from './meta';

export function generate(input: Input): Output {
  const services: Services = [];
  const dbPassword = randomPassword();

  // Database service
  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-db`,
      source: {
        type: "image",
        image: "mariadb:11.4.5",
      },
      env: [
        `MARIADB_ROOT_PASSWORD=${dbPassword}`,
        `MARIADB_DATABASE=${input.dbName}`,
        `MARIADB_USER=${input.dbUser}`,
        `MARIADB_PASSWORD=${dbPassword}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "db",
          mountPath: "/var/lib/mysql",
        },
      ],
    },
  });

  // Akaunting service
  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: "docker.io/akaunting/akaunting:3.1.14-v",
      },
      env: [
        `AKAUNTING_SETUP=false`,
        `APP_URL=https://$(EASYPANEL_DOMAIN)`,
        `APP_DEBUG=false`,
        `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `DB_PORT=3306`,
        `DB_DATABASE=${input.dbName}`,
        `DB_USERNAME=${input.dbUser}`,
        `DB_PASSWORD=${dbPassword}`,
        `COMPANY_NAME=${input.companyName}`,
        `COMPANY_EMAIL=${input.companyEmail}`,
        `ADMIN_EMAIL=${input.adminEmail}`,
        `ADMIN_PASSWORD=${randomPassword()}`,
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
          mountPath: "/var/www/html",
        },
      ],
    },
  });

  return { services };
}