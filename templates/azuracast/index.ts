import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const protectedPorts = [
    3306, // MariaDB
    6010, // Nginx internal
    6379, // Redis
    8080, // Common debug port
    80,   // HTTP
    443,  // HTTPS
    2022, // SFTP
  ];
  
  const ports = [
    {
      published: input.appSftpPort,
      target: input.appSftpPort
    }
  ];

  for(let i = input.appMinimumStationPort; i < input.appMaximumStationPort; i += 10) {
    if (protectedPorts.includes(i)) {
      continue;
    }

    ports.push({
      published: i,
      target: i
    });
    ports.push({
      published: i+5,
      target: i+5
    });
    ports.push({
      published: i+6,
      target: i+6
    });
  }

  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `AZURACAST_HTTP_PORT=${input.appHttpPort}`,
        `AZURACAST_HTTPS_PORT=${input.appHttpsPort}`,
        `AZURACAST_SFTP_PORT=${input.appSftpPort}`,
        `MYSQL_ROOT_PASSWORD=${databasePassword}`,
        `AUTO_ASSIGN_PORT_MIN=${input.appMinimumStationPort}`,
        `AUTO_ASSIGN_PORT_MAX=${input.appMaximumStationPort}`
      ].join("\n"),
      source: { type: "image", image: "ghcr.io/azuracast/azuracast:"+input.appServiceVersion },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: input.appHttpPort,
          https: false
        },
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: input.appHttpsPort,
          https: true
        },
      ],
      ports: ports,
      mounts: [
        {
          type: "volume",
          name: "station_data",
          mountPath: "/var/azuracast/stations",
        },
        {
          type: "volume",
          name: "backups",
          mountPath: "/var/azuracast/backups",
        },
        {
          type: "volume",
          name: "db_data",
          mountPath: "/var/lib/mysql",
        },
        {
          type: "volume",
          name: "storage",
          mountPath: "/var/azuracast/storage",
        }
      ],
    },
  });

  return { services };
}
