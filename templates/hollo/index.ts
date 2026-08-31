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
  const secretKey = randomString(64);

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
          port: 3000,
        },
      ],
      env: [
        `DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${databaseServiceName}:5432/$(PROJECT_NAME)`,
        `SECRET_KEY=${secretKey}`,
        `BEHIND_PROXY=${input.behindProxy ? "true" : "false"}`,
        `DRIVE_DISK=fs`,
        `STORAGE_URL_BASE=https://$(PRIMARY_DOMAIN)/assets/`,
        `FS_STORAGE_PATH=/var/lib/hollo`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "assets",
          mountPath: "/var/lib/hollo",
        },
      ],
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
