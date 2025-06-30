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
  const secretKeyBase = randomString(64);

  const appEnv = [
    `BASE_URL=$(PRIMARY_DOMAIN)`,
    `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
    `SECRET_KEY_BASE=${secretKeyBase}`,
    `PRESENTATION_STORAGE=local`,
    `PRESENTATION_STORAGE_DIR=/app/uploads`,
    `MAX_FILE_SIZE_MB=15`,
    `ENABLE_ACCOUNT_CREATION=true`,
    `EMAIL_CONFIRMATION=false`,
  ];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: appEnv.join("\n"),
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
      mounts: [
        {
          type: "volume",
          name: "uploads",
          mountPath: "/app/uploads",
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
