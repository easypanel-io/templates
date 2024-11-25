import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const secretKeyBase = randomString();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `SELF_HOSTED=true`,
        `RAILS_FORCE_SSL=false`,
        `RAILS_ASSUME_SSL=false`,
        `GOOD_JOB_EXECUTION_MODE=async`,
        `SECRET_KEY_BASE=${secretKeyBase}`,
        `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-postgres`,
        `POSTGRES_DB=$(PROJECT_NAME)`,
        `POSTGRES_USER=postgres`,
        `POSTGRES_PASSWORD=${databasePassword}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "storage",
          mountPath: "/rails/storage",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-postgres`,
      password: databasePassword,
    },
  });

  return { services };
}
