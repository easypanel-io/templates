import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  const appEnv = [
    `ESPOCRM_DATABASE_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
    `ESPOCRM_DATABASE_NAME=$(PROJECT_NAME)`,
    `ESPOCRM_DATABASE_USER=${input.databaseServiceType}`,
    `ESPOCRM_DATABASE_PASSWORD=${databasePassword}`,
    `ESPOCRM_ADMIN_USERNAME=${input.adminUsername}`,
    `ESPOCRM_ADMIN_PASSWORD=${input.adminPassword}`,
    `ESPOCRM_SITE_URL=https://$(PRIMARY_DOMAIN)`,
  ];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [{ type: "volume", name: "espocrm", mountPath: "/var/www/html" }],
      env: appEnv.join("\n"),
      deploy: {
        command: `chmod -R 755 /var/www/html && docker-entrypoint.sh apache2-foreground`,
      },
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName + "-daemon",
      source: { type: "image", image: input.appServiceImage },
      deploy: { command: "sleep 120; docker-daemon.sh" },
      mounts: [
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}/volumes/espocrm`,
          mountPath: "/var/www/html",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName + "-websocket",
      source: { type: "image", image: input.appServiceImage },
      deploy: { command: "sleep 120; docker-websocket.sh" },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}/volumes/espocrm`,
          mountPath: "/var/www/html",
        },
      ],
      env: [
        `ESPOCRM_CONFIG_USE_WEB_SOCKET=true`,
        `ESPOCRM_CONFIG_WEB_SOCKET_URL=wss://$(PRIMARY_DOMAIN)`,
        `ESPOCRM_CONFIG_WEB_SOCKET_ZERO_M_Q_SUBSCRIBER_DSN=tcp://*:7777`,
        `ESPOCRM_CONFIG_WEB_SOCKET_ZERO_M_Q_SUBMISSION_DSN=tcp://$(PROJECT_NAME)_${input.appServiceName}-websocket:7777`,
      ].join("\n"),
    },
  });

  services.push({
    type: input.databaseServiceType,
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
