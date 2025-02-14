import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from './meta';

export function generate(input: Input): Output {
  const services: Services = [];
  const dbPassword = randomPassword();

  // Database service - using managed MySQL
  services.push({
    type: "mysql",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: dbPassword,
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
        `APP_URL=$(PRIMARY_DOMAIN)`,
        `APP_DEBUG=false`,
        `DB_HOST=${input.appServiceName}-db`,
        `DB_PORT=3306`,
        `DB_DATABASE=easypanel`,
        `DB_USERNAME=easypanel`,
        `DB_PASSWORD=${dbPassword}`,
        `COMPANY_NAME=${input.companyName}`,
        `COMPANY_EMAIL=${input.companyEmail}`,
        `ADMIN_EMAIL=${input.adminEmail}`,
        `ADMIN_PASSWORD=${input.adminPassword}`,
      ].join("\n"),
      domains: [
        {
          host: "$(PRIMARY_DOMAIN)",
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