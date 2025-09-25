import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const dbPassword = randomPassword();
  const randomPasskey = randomString(32);
  const randomWebhookSecret = randomString(32);
  const randomJwtSecret = randomString(32);

  services.push({
    type: "mongo",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: dbPassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-core`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 9120,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "komodo-backups",
          mountPath: "/backups",
        },
      ],
      env: [
        `KOMODO_DATABASE_ADDRESS=$(PROJECT_NAME)_${input.appServiceName}-db:27017`,
        `KOMODO_DATABASE_USERNAME=mongo`,
        `KOMODO_DATABASE_PASSWORD=${dbPassword}`,
        `KOMODO_HOST=https://$(PRIMARY_DOMAIN)`,
        `KOMODO_TITLE=Komodo`,
        `KOMODO_FIRST_SERVER=https://$(PROJECT_NAME)_${input.appServiceName}-periphery:8120`,
        `KOMODO_FIRST_SERVER_NAME=Local`,
        `KOMODO_DISABLE_CONFIRM_DIALOG=false`,
        `KOMODO_MONITORING_INTERVAL="15-sec"`,
        `KOMODO_RESOURCE_POLL_INTERVAL="1-hr"`,
        `KOMODO_WEBHOOK_SECRET=${randomWebhookSecret}`,
        `KOMODO_JWT_SECRET=${randomJwtSecret}`,
        `KOMODO_JWT_TTL="1-day"`,
        `KOMODO_LOCAL_AUTH=true`,
        `KOMODO_INIT_ADMIN_USERNAME=${input.adminUsername}`,
        `KOMODO_INIT_ADMIN_PASSWORD=${input.adminPassword}`,
        `KOMODO_DISABLE_USER_REGISTRATION=false`,
        `KOMODO_ENABLE_NEW_USERS=false`,
        `KOMODO_DISABLE_NON_ADMIN_CREATE=false`,
        `KOMODO_TRANSPARENT_MODE=false`,
        `KOMODO_LOGGING_PRETTY=false`,
        `KOMODO_PRETTY_STARTUP_CONFIG=false`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-periphery`,
      source: {
        type: "image",
        image: input.peripheryImage,
      },
      mounts: [
        {
          type: "bind",
          hostPath: "/var/run/docker.sock",
          mountPath: "/var/run/docker.sock",
        },
        {
          type: "bind",
          hostPath: "/proc",
          mountPath: "/proc",
        },
        {
          type: "volume",
          name: "komodo-periphery",
          mountPath: "/etc/komodo",
        },
      ],
      env: [
        `KOMODO_DATABASE_ADDRESS=$(PROJECT_NAME)_${input.appServiceName}-db:27017`,
        `KOMODO_DATABASE_USERNAME=mongo`,
        `KOMODO_DATABASE_PASSWORD=${dbPassword}`,
        `PERIPHERY_ROOT_DIRECTORY=/etc/komodo`,
        `PERIPHERY_PASSKEYS=${randomPasskey}`,
        `PERIPHERY_DISABLE_TERMINALS=false`,
        `PERIPHERY_SSL_ENABLED=true`,
        `PERIPHERY_INCLUDE_DISK_MOUNTS=/etc/hostname`,
        `PERIPHERY_LOGGING_PRETTY=false`,
      ].join("\n"),
    },
  });

  return { services };
}
