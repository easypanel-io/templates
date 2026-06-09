import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  const common_envs = [
    `DB_SERVER_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
    `POSTGRES_USER=postgres`,
    `POSTGRES_PASSWORD=${databasePassword}`,
    `POSTGRES_DB=$(PROJECT_NAME)`,
  ].join("\n");

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        common_envs,
        `ZBX_SERVER_HOST=$(PROJECT_NAME)_${input.appServiceName}-server`,
        `PHP_TZ=Europe/London`,
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
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-server`,
      env: [common_envs].join("\n"),
      source: {
        type: "image",
        image: input.zabbixServerServiceImage,
      },
      mounts: [
        {
          type: "volume",
          name: "zabbix",
          mountPath: "/var/lib/zabbix",
        },
        {
          type: "volume",
          name: "snmptraps",
          mountPath: "/var/lib/zabbix/snmptraps",
        },
        {
          type: "volume",
          name: "export",
          mountPath: "/var/lib/zabbix/export",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-agent`,
      env: [
        `ZBX_HOSTNAME=$(PROJECT_NAME)_${input.appServiceName}-server`,
        `ZBX_SERVER_HOST=$(PROJECT_NAME)_${input.appServiceName}-server`,
        `ZBX_SERVER_PORT=10051`,
        `ZBX_SERVER_ACTIVE=$(PROJECT_NAME)_${input.appServiceName}-server`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.zabbixAgentServiceImage,
      },
      mounts: [
        {
          type: "volume",
          name: "zabbix",
          mountPath: "/usr/share/zabbix",
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

  return { services };
}
