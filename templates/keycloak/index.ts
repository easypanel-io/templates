import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `KC_DB=postgres`,
        `KC_DB_URL_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `KC_DB_URL_DATABASE=$(PROJECT_NAME)`,
        `KC_DB_USERNAME=postgres`,
        `KC_DB_PASSWORD=${databasePassword}`,
        `KC_BOOTSTRAP_ADMIN_USERNAME=${input.keycloakUsername}`,
        `KC_BOOTSTRAP_ADMIN_PASSWORD=${input.keycloakPassword}`,
        `KC_HOSTNAME_STRICT_HTTPS=false`,
        `KC_HOSTNAME=https://$(PRIMARY_DOMAIN)`,
        `KC_HOSTNAME_ADMIN=https://$(PRIMARY_DOMAIN)`,
        `PROXY_ADDRESS_FORWARDING=true`,
        `KC_HTTP_ENABLED=false`,
        `KC_FEATURES=docker`,
        `KC_PROXY_HEADERS=xforwarded`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/opt/keycloak",
        },
        {
          type: "volume",
          name: "themes",
          mountPath: "/opt/bitnami/keycloak/themes",
        },
      ],
      deploy: {
        command: "/opt/keycloak/bin/kc.sh start-dev",
      },
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  return { services };
}
