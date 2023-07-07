import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  const appEnv = [
    `ESPOCRM_DATABASE_HOST=${input.projectName}_${input.databaseServiceName}`,
    `ESPOCRM_DATABASE_NAME=${input.projectName}`,
    `ESPOCRM_DATABASE_USER=${input.databaseServiceType}`,
    `ESPOCRM_DATABASE_PASSWORD=${databasePassword}`,
    `ESPOCRM_ADMIN_USERNAME=${input.adminUsername}`,
    `ESPOCRM_ADMIN_PASSWORD=${input.adminPassword}`,
  ];

  if (input.domain) appEnv.push(`ESPOCRM_SITE_URL=https://${input.domain}`);

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: input.domain ? [{ name: input.domain }] : [],
      proxy: { port: 80, secure: true },
      mounts: [{ type: "volume", name: "espocrm", mountPath: "/var/www/html" }],
      env: appEnv.join("\n"),
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
          hostPath: `/etc/easypanel/projects/${input.projectName}/${input.appServiceName}/volumes/espocrm`,
          mountPath: "/var/www/html",
        },
      ],
    },
  });

  if (input.wsDomain) {
    services.push({
      type: "app",
      data: {
        projectName: input.projectName,
        serviceName: input.appServiceName + "-websocket",
        source: { type: "image", image: input.appServiceImage },
        deploy: { command: "sleep 120; docker-websocket.sh" },
        proxy: { port: 8080, secure: true },
        domains: [{ name: input.wsDomain }],
        mounts: [
          {
            type: "bind",
            hostPath: `/etc/easypanel/projects/${input.projectName}/${input.appServiceName}/volumes/espocrm`,
            mountPath: "/var/www/html",
          },
        ],
        env: [
          `ESPOCRM_CONFIG_USE_WEB_SOCKET=true`,
          `ESPOCRM_CONFIG_WEB_SOCKET_URL=wss://${input.wsDomain}`,
          `ESPOCRM_CONFIG_WEB_SOCKET_ZERO_M_Q_SUBSCRIBER_DSN=tcp://*:7777`,
          `ESPOCRM_CONFIG_WEB_SOCKET_ZERO_M_Q_SUBMISSION_DSN=tcp://${input.projectName}_${input.appServiceName}-websocket:7777`,
        ].join("\n"),
      },
    });
  }

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
