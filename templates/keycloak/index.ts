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
        `KEYCLOAK_DATABASE_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `KEYCLOAK_DATABASE_NAME=$(PROJECT_NAME)`,
        `KEYCLOAK_DATABASE_USER=postgres`,
        `KEYCLOAK_DATABASE_PASSWORD=${databasePassword}`,
        `KEYCLOAK_ADMIN_USER=${input.keycloakUsername}`,
        `KEYCLOAK_ADMIN_PASSWORD=${input.keycloakPassword}`,
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
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
