import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const databasePassword = randomPassword();
  const redisPassword = randomPassword();

  const common_envs = [
    `DISCOURSE_HOSTNAME=$(PRIMARY_DOMAIN)`,
    `DISCOURSE_DATABASE_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
    `DISCOURSE_DATABASE_PORT_NUMBER=5432`,
    `DISCOURSE_DATABASE_NAME=$(PROJECT_NAME)`,
    `DISCOURSE_DATABASE_USER=postgres`,
    `DISCOURSE_DATABASE_PASSWORD=${databasePassword}`,
    `DISCOURSE_REDIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
    `DISCOURSE_REDIS_PORT_NUMBER=6379`,
    `DISCOURSE_REDIS_PASSWORD=${redisPassword}`,
  ].join("\n");
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
          port: 80,
        },
      ],
      env: [
        common_envs,
        `DISCOURSE_USERNAME=${input.discourseUsername}`,
        `DISCOURSE_PASSWORD=${input.discoursePassword}`,
        `DISCOURSE_EMAIL=${input.discourseEmail}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "discourse_data",
          mountPath: "/bitnami/discourse",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-sidekiq`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [common_envs, `DISCOURSE_SKIP_INSTALL=yes`].join("\n"),
      mounts: [
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}/volumes/discourse_data`,
          mountPath: "/bitnami/discourse",
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

  services.push({
    type: "redis",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      password: redisPassword,
    },
  });

  return { services };
}
