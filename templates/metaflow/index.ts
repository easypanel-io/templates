import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  const dbHost = `$(PROJECT_NAME)_${input.appServiceName}-db`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.metadataServiceImage,
      },
      env: [
        `MF_METADATA_DB_HOST=${dbHost}`,
        "MF_METADATA_DB_PORT=5432",
        "MF_METADATA_DB_USER=postgres",
        `MF_METADATA_DB_PSWD=${databasePassword}`,
        `MF_METADATA_DB_NAME=$(PROJECT_NAME)`,
        "MF_MIGRATION_ENDPOINTS_ENABLED=1",
        "MF_METADATA_PORT=8080",
        "MF_METADATA_HOST=0.0.0.0",
        "MF_MIGRATION_PORT=8082",
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
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
