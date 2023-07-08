import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  let dbtype = "sqlite3";
  let dbConfig = "./data/focalboard.db";

  if (input.databaseType !== "sqlite3") {
    const databasePassword = randomPassword();
    services.push({
      type: input.databaseType,
      data: {
        projectName: input.projectName,
        serviceName: input.databaseServiceName,
        password: databasePassword,
      },
    });
    if (input.databaseType === "postgres") {
      dbtype = "postgres";
      dbConfig = `postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}/$(PROJECT_NAME)?sslmode=disable&connect_timeout=10`;
    } else {
      dbtype = "mysql";
      dbConfig = `${input.databaseType}:${databasePassword}@tcp($(PROJECT_NAME)_${input.databaseServiceName}:3306)/$(PROJECT_NAME)`;
    }
  }

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      mounts: [
        { type: "volume", name: "fbdata", mountPath: "/opt/focalboard/data" },
        {
          type: "file",
          content: JSON.stringify(
            {
              serverRoot: `https://$(PRIMARY_DOMAIN)`,
              port: 8000,
              dbtype: dbtype,
              dbconfig: dbConfig,
              useSSL: true,
              webpath: "./pack",
              filespath: "./data/files",
              telemetry: input.telemetry,
              session_expire_time: 2592000,
              session_refresh_time: 18000,
              localOnly: false,
              enableLocalMode: false,
              localModeSocketLocation: "/var/tmp/focalboard_local.socket",
              enablePublicSharedBoards: input.enablePublicSharedBoards,
            },
            null,
            2
          ),
          mountPath: "/opt/focalboard/config.json",
        },
      ],
    },
  });

  return { services };
}
