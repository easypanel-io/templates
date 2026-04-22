import {
  Output,
  randomPassword,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const databasePassword = randomPassword();

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-valkey`,
      source: {
        type: "image",
        image: input.valkeyImage,
      },
    },
  });

  const env = [
    `MONETR_ALLOW_SIGN_UP=${input.allowSignUp || "true"}`,
    `MONETR_PG_USERNAME=postgres`,
    `MONETR_PG_PASSWORD=${databasePassword}`,
    `MONETR_PG_DATABASE=$(PROJECT_NAME)`,
    `MONETR_PG_ADDRESS=$(PROJECT_NAME)_${input.appServiceName}-db`,
    `MONETR_REDIS_ENABLED=true`,
    `MONETR_REDIS_ADDRESS=$(PROJECT_NAME)_${input.appServiceName}-valkey`,
    `MONETR_STORAGE_ENABLED=${input.storageEnabled || "true"}`,
    `MONETR_STORAGE_PROVIDER=${input.storageProvider || "filesystem"}`,
  ];

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
          port: 4000,
        },
      ],
      env: env.join("\n"),
      deploy: {
        command: "/usr/bin/monetr serve --migrate --generate-certificates",
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/etc/monetr",
        },
      ],
    },
  });

  return { services };
}
