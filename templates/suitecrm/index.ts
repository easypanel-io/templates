import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mariaPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `SUITECRM_DATABASE_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `SUITECRM_DATABASE_PORT_NUMBER=3306`,
        `SUITECRM_DATABASE_NAME=$(PROJECT_NAME)`,
        `SUITECRM_DATABASE_USER=mariadb`,
        `SUITECRM_DATABASE_PASSWORD=${mariaPassword}`,
        `SUITECRM_HOST=$(PRIMARY_DOMAIN)`,
        `SUITECRM_USERNAME=${input.suitecrmUsername}`,
        `SUITECRM_PASSWORD=${input.suitecrmPassword}`,
        `SUITECRM_EMAIL=${input.suitecrmEmail}`,
      ].join("\n"),
      source: { type: "image", image: input.appServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 8080 }],
      mounts: [
        { type: "volume", name: "vendor", mountPath: "/bitnami/suitecrm" },
      ],
    },
  });

  services.push({
    type: "mariadb",
    data: { serviceName: input.databaseServiceName, password: mariaPassword },
  });

  return { services };
}
