import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `TS3SERVER_DB_PLUGIN=ts3db_mariadb`,
        `TS3SERVER_DB_SQLCREATEPATH=create_mariadb`,
        `TS3SERVER_DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `TS3SERVER_DB_USER=mariadb`,
        `TS3SERVER_DB_PASSWORD=${databasePassword}`,
        `TS3SERVER_DB_NAME=$(PROJECT_NAME)`,
        `TS3SERVER_DB_WAITUNTILREADY=30`,
        `TS3SERVER_LICENSE=accept`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 9987,
        },
      ],
      ports: [
        {
          published: Number(input.queryServerPort),
          target: 10011,
          protocol: "tcp",
        },
        {
          published: Number(input.virtualBaseServerPort),
          target: 9987,
          protocol: "udp",
        },
        {
          published: Number(input.fileManagerPort),
          target: 30033,
          protocol: "tcp",
        },
      ],
    },
  });

  services.push({
    type: "mariadb",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  return { services };
}
