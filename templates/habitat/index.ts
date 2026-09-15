import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const postgresPassword = randomPassword();
  const appSecret = randomString(32);
  const encryptionKey = randomString(32);

  const dbHostname = `$(PROJECT_NAME)_${input.appServiceName}-db`;
  const databaseUrl = `postgresql://postgres:${postgresPassword}@${dbHostname}:5432/$(PROJECT_NAME)?serverVersion=16&charset=utf8`;

  const sharedEnv = [
    `SERVER_NAME=:80`,
    `APP_SECRET=${appSecret}`,
    `ENCRYPTION_KEY=${encryptionKey}`,
    `DATABASE_URL=${databaseUrl}`,
  ].join("\n");

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: sharedEnv,
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "uploads",
          mountPath: "/uploads",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-worker`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [sharedEnv, `RUN_MIGRATIONS=false`].join("\n"),
      deploy: {
        command:
          "bin/console messenger:consume -vv --time-limit=600 --limit=10 --memory-limit=128M",
      },
      mounts: [
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}/volumes/uploads`,
          mountPath: "/uploads",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: postgresPassword,
    },
  });

  return { services };
}
