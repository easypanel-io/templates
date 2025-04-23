import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secretKey = randomString(50);
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();

  const commonEnv = [
    `AUTHENTIK_REDIS__HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
    `AUTHENTIK_REDIS__PORT=6379`,
    `AUTHENTIK_REDIS__DB=0`,
    `AUTHENTIK_REDIS__USERNAME=default`,
    `AUTHENTIK_REDIS__PASSWORD=${redisPassword}`,
    `AUTHENTIK_POSTGRESQL__HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
    `AUTHENTIK_POSTGRESQL__USER=postgres`,
    `AUTHENTIK_POSTGRESQL__NAME=$(PROJECT_NAME)`,
    `AUTHENTIK_POSTGRESQL__PASSWORD=${databasePassword}`,
    `AUTHENTIK_SECRET_KEY=${secretKey}`,
    "AUTHENTIK_ERROR_REPORTING__ENABLED=false",
    "AUTHENTIK_DISABLE_UPDATE_CHECK=true",
    "AUTHENTIK_WORKER__CONCURRENCY=1",
  ].join("\n");

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-server`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [commonEnv].join("\n"),

      mounts: [
        {
          type: "volume",
          name: "authentik-media",
          mountPath: "/media",
        },
        {
          type: "volume",
          name: "authentik-templates",
          mountPath: "/templates",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 9000,
        },
      ],
      deploy: {
        command: "dumb-init -- ak server",
      },
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      password: redisPassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-worker`,
      source: {
        type: "image",
        image: "dockeriddonuts/authentik-worker:2.0",
      },
      env: [commonEnv].join("\n"),

      mounts: [
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}-server/volumes/authentik-media`,
          mountPath: "/media",
        },
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}-server/volumes/authentik-templates`,
          mountPath: "/templates",
        },
      ],
    },
  });

  return { services };
}
