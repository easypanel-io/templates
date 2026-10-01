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
        `KESTRA_URL=https://$(PRIMARY_DOMAIN)`,
        `KESTRA_SERVER_BASIC_AUTH_USERNAME=${input.adminEmail}`,
        `KESTRA_SERVER_BASIC_AUTH_PASSWORD=${input.adminPassword}`,
        `DATASOURCES_POSTGRES_URL=jdbc:postgresql://$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
        `DATASOURCES_POSTGRES_DRIVER_CLASS_NAME=org.postgresql.Driver`,
        `DATASOURCES_POSTGRES_USERNAME=postgres`,
        `DATASOURCES_POSTGRES_PASSWORD=${databasePassword}`,
        `KESTRA_REPOSITORY_TYPE=postgres`,
        `KESTRA_QUEUE_TYPE=postgres`,
        `KESTRA_CONFIGURATION={kestra: {storage: {type: local, local: {base-path: /app/storage}}}}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: "/app/kestra server standalone",
        // A standalone server must not run twice against the same database.
        zeroDowntime: false,
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
          name: "storage",
          mountPath: "/app/storage",
        },
      ],
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
