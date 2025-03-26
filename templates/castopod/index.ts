import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const dbPassword = randomPassword();
  const redisPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `CP_DATABASE_PASSWORD=${dbPassword}`,
        `CP_DATABASE_USERNAME=mariadb`,
        `CP_DATABASE_NAME=$(PROJECT_NAME)`,
        `CP_DATABASE_HOSTNAME=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `CP_BASEURL=https://$(PRIMARY_DOMAIN)`,
        `CP_ANALYTICS_SALT=changeme`,
        `CP_CACHE_HANDLER=redis`,
        `CP_REDIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
        `CP_REDIS_PASSWORD=${redisPassword}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/cp-install",
          port: 8000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "castopod-media",
          mountPath: "/var/www/castopod/public/media",
        },
      ],
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      password: redisPassword,
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
