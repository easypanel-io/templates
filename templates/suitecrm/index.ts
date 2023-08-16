import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mariaPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `SUITECRM_DATABASE_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `SUITECRM_DATABASE_PORT_NUMBER=3306`,
        `SUITECRM_DATABASE_NAME=$(PROJECT_NAME)`,
        `SUITECRM_DATABASE_USER=mariadb`,
        `SUITECRM_DATABASE_PASSWORD=${mariaPassword}`,
        `SUITECRM_ENABLE_HTTPS=yes`,
        `SUITECRM_HOST=$(PRIMARY_DOMAIN)`,
        `SUITECRM_USERNAME=${input.suitecrmUsername || "admin"}`,
        `SUITECRM_PASSWORD=${input.suitecrmPassword || "admin"}`,
        `SUITECRM_EMAIL=${input.suitecrmEmail || "admin@example.com"}`,
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
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: mariaPassword,
    },
  });

  return { services };
}
