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

  // Since v10 the image ships its own app files in the image; mounting the
  // whole /var/www/html hides them (including the installer). Only these
  // three directories should be mounted. All three processes (web, daemon,
  // websocket) share them via matching bind mounts to the same host paths.
  const sharedMounts = [
    {
      type: "volume" as const,
      name: "espocrm-data",
      mountPath: "/var/www/html/data",
    },
    {
      type: "volume" as const,
      name: "espocrm-custom",
      mountPath: "/var/www/html/custom",
    },
    {
      type: "volume" as const,
      name: "espocrm-client-custom",
      mountPath: "/var/www/html/client/custom",
    },
  ];
  const sharedBindMounts = (basePath: string) => [
    {
      type: "bind" as const,
      hostPath: `${basePath}/espocrm-data`,
      mountPath: "/var/www/html/data",
    },
    {
      type: "bind" as const,
      hostPath: `${basePath}/espocrm-custom`,
      mountPath: "/var/www/html/custom",
    },
    {
      type: "bind" as const,
      hostPath: `${basePath}/espocrm-client-custom`,
      mountPath: "/var/www/html/client/custom",
    },
  ];
  const volumesBasePath = `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}/volumes`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: sharedMounts,
      env: appEnv.join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName + "-daemon",
      source: { type: "image", image: input.appServiceImage },
      deploy: { command: "sleep 120; docker-daemon.sh" },
      mounts: sharedBindMounts(volumesBasePath),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName + "-websocket",
      source: { type: "image", image: input.appServiceImage },
      deploy: { command: "sleep 120; docker-websocket.sh" },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      mounts: sharedBindMounts(volumesBasePath),
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
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
