import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-web`,
      env: [
        `DOCKER_MAUTIC_LOAD_TEST_DATA=false`,
        `DOCKER_MAUTIC_RUN_MIGRATIONS=true`,
        `MAUTIC_DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `MAUTIC_DB_PORT=3306`,
        `MAUTIC_DB_DATABASE=$(PROJECT_NAME)`,
        `MAUTIC_DB_USER=mysql`,
        `MAUTIC_DB_PASSWORD=${databasePassword}`,
        `MAUTIC_PORT=8001`,
        `MAUTIC_MESSENGER_DSN_EMAIL=doctrine://default`,
        `MAUTIC_MESSENGER_DSN_HIT=doctrine://default`,
      ].join("\n"),
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
      mounts: [
        {
          type: "volume",
          name: "cron",
          mountPath: "/opt/mautic/cron",
        },

        {
          type: "volume",
          name: "images",
          mountPath: "/var/www/html/docroot/media/images",
        },
        {
          type: "volume",
          name: "files",
          mountPath: "/var/www/html/docroot/media/files",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/var/www/html/var/logs",
        },
        {
          type: "volume",
          name: "config",
          mountPath: "/var/www/html/config",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-cron`,
      env: [
        `DOCKER_MAUTIC_ROLE=mautic_cron`,
        `MAUTIC_DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `MAUTIC_DB_PORT=3306`,
        `MAUTIC_DB_DATABASE=$(PROJECT_NAME)`,
        `MAUTIC_DB_USER=mysql`,
        `MAUTIC_DB_PASSWORD=${databasePassword}`,
        `MAUTIC_PORT=8001`,
        `MAUTIC_MESSENGER_DSN_EMAIL=doctrine://default`,
        `MAUTIC_MESSENGER_DSN_HIT=doctrine://default`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      mounts: [
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}-web/volumes/cron`,
          mountPath: "/opt/mautic/cron",
        },
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}-web/volumes/config`,
          mountPath: "/var/www/html/config",
        },
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}-web/volumes/logs`,
          mountPath: "/var/www/html/var/logs",
        },
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}-web/volumes/files`,
          mountPath: "/var/www/html/docroot/media/files",
        },
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}-web/volumes/images`,
          mountPath: "/var/www/html/docroot/media/images",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-worker`,
      env: [
        `DOCKER_MAUTIC_ROLE=mautic_worker`,
        `DOCKER_MAUTIC_WORKERS_CONSUME_EMAIL=2`,
        `DOCKER_MAUTIC_WORKERS_CONSUME_HIT=2`,
        `DOCKER_MAUTIC_WORKERS_CONSUME_FAILED=2`,
        `MAUTIC_DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `MAUTIC_DB_PORT=3306`,
        `MAUTIC_DB_DATABASE=$(PROJECT_NAME)`,
        `MAUTIC_DB_USER=mysql`,
        `MAUTIC_DB_PASSWORD=${databasePassword}`,
        `MAUTIC_PORT=8001`,
        `MAUTIC_MESSENGER_DSN_EMAIL=doctrine://default`,
        `MAUTIC_MESSENGER_DSN_HIT=doctrine://default`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      mounts: [
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}-web/volumes/cron`,
          mountPath: "/opt/mautic/cron",
        },
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}-web/volumes/config`,
          mountPath: "/var/www/html/config",
        },
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}-web/volumes/logs`,
          mountPath: "/var/www/html/var/logs",
        },
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}-web/volumes/files`,
          mountPath: "/var/www/html/docroot/media/files",
        },
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}-web/volumes/images`,
          mountPath: "/var/www/html/docroot/media/images",
        },
      ],
    },
  });

  services.push({
    type: "mysql",
    data: {
      serviceName: input.databaseServiceName,
      image: "mysql:8",
      password: databasePassword,
    },
  });
  return { services };
}
