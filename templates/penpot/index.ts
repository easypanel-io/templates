import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-frontend`,
      env: [
        `PENPOT_BACKEND_URI=http://$(PROJECT_NAME)_${input.appServiceName}-backend:6060`,
        `PENPOT_EXPORTER_URI=http://$(PROJECT_NAME)_${input.appServiceName}-exporter:6061`,
      ].join("\n"),
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
      mounts: [
        {
          type: "volume",
          name: "assets",
          mountPath: "/opt/data/assets",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-backend`,
      env: [
        `PENPOT_FLAGS=enable-registration enable-login-with-password disable-email-verification enable-smtp enable-prepl-server`,
        `PENPOT_PUBLIC_URI=https://$(PRIMARY_DOMAIN)`,
        `PENPOT_DATABASE_URI=postgresql://$(PROJECT_NAME)_${input.databaseServiceName}/$(PROJECT_NAME)`,
        `PENPOT_DATABASE_USERNAME=postgres`,
        `PENPOT_DATABASE_PASSWORD=${databasePassword}`,
        `PENPOT_REDIS_URI=redis://default:${redisPassword}@$(PROJECT_NAME)_${input.redisServiceName}/0`,
        `PENPOT_ASSETS_STORAGE_BACKEND=assets-fs`,
        `PENPOT_STORAGE_ASSETS_FS_DIRECTORY=/opt/data/assets`,
        `PENPOT_TELEMETRY_ENABLED=true`,
        `PENPOT_SMTP_DEFAULT_FROM=no-reply@example.com`,
        `PENPOT_SMTP_DEFAULT_REPLY_TO=no-reply@example.com`,
        `PENPOT_SMTP_HOST=penpot-mailcatch`,
        `PENPOT_SMTP_PORT=1025`,
        `PENPOT_SMTP_USERNAME=`,
        `PENPOT_SMTP_PASSWORD=`,
        `PENPOT_SMTP_TLS=false`,
        `PENPOT_SMTP_SSL=false`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appBackendServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}-frontend/volumes/assets`,
          mountPath: "/opt/data/assets",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-exporter`,
      env: [
        `PENPOT_PUBLIC_URI=http://$(PROJECT_NAME)_${input.appServiceName}-frontend`,
        `PENPOT_REDIS_URI=redis://default:${redisPassword}@$(PROJECT_NAME)_${input.redisServiceName}/0`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appExporterServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: input.redisServiceName,
      password: redisPassword,
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
