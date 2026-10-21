import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const databaseServiceName = `${input.appServiceName}-db`;
  const databasePassword = randomPassword();
  const jwtEncryptionKey = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: `ghcr.io/jovandeginste/workout-tracker:${input.workoutTrackerVersion}`,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      env: [
        `WT_DATABASE_DRIVER=postgres`,
        `WT_DSN=host=$(PROJECT_NAME)_${databaseServiceName} user=postgres password=${databasePassword} dbname=$(PROJECT_NAME) port=5432 sslmode=disable TimeZone=UTC`,
        `WT_JWT_ENCRYPTION_KEY=${jwtEncryptionKey}`,
        `WT_REGISTRATION_DISABLED=${
          input.registrationDisabled ? "true" : "false"
        }`,
      ].join("\n"),
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
