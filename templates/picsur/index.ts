import { Output, randomPassword, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const jwtSecret = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
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
      env: [
        `PICSUR_HOST=0.0.0.0`,
        `PICSUR_PORT=8080`,
        `PICSUR_DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `PICSUR_DB_PORT=5432`,
        `PICSUR_DB_USERNAME=postgres`,
        `PICSUR_DB_PASSWORD=${databasePassword}`,
        `PICSUR_DB_DATABASE=$(PROJECT_NAME)`,
        `PICSUR_ADMIN_PASSWORD=picur`,
        `PICSUR_JWT_SECRET=${jwtSecret}`,
        `PICSUR_JWT_EXPIRY=1h`,
        `PICSUR_MAX_FILE_SIZE=104857600`,
        `PICSUR_VERBOSE=false`,
      ].join("\n"),
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