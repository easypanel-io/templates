import {
  Output,
  randomPassword,
  Services
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `KEYCLOAK_DATABASE_HOST=${input.projectName}_${input.databaseServiceName}`,
        `KEYCLOAK_DATABASE_NAME=${input.databaseServiceName}`,
        `KEYCLOAK_DATABASE_USER=postgres`,
        `KEYCLOAK_DATABASE_PASSWORD=${databasePassword}`,
        `KEYCLOAK_ADMIN_USER=${input.keycloakUsername}`,
        `KEYCLOAK_ADMIN_PASSWORD=${input.keycloakPassword}`,
        `KC_HOSTNAME_STRICT_HTTPS=false`,
        `KC_HOSTNAME=${input.domain}`,
        `KC_HOSTNAME_ADMIN=${input.domain}`,
        `PROXY_ADDRESS_FORWARDING=true`,
        `KC_HTTP_ENABLED=false`,
        `KC_FEATURES=docker`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 8080,
        secure: true,
      },
      domains: [
        {
          name: input.domain,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/opt/keycloak"
        }
      ]
    },
  });

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
