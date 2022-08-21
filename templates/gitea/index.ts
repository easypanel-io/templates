import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const databaseUsername =
    input.databaseType === "postgres" ? "postgres" : "mysql";
  const databasePort = input.databaseType === "postgres" ? "5432" : "3306";

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `USER_UID=1000`,
        `USER_GID=1000`,
        `ROOT_URL=https://${domain}`,
        `GITEA__database__DB_TYPE=${input.databaseType}`,
        `GITEA__database__HOST=${input.projectName}_${input.databaseServiceName}:${databasePort}`,
        `GITEA__database__NAME=${input.projectName}`,
        `GITEA__database__USER=${databaseUsername}`,
        `GITEA__database__PASSWD=${databasePassword}`,
      ].join("\n"),
      source: {
        type: "image",
        image: "gitea/gitea:latest",
      },
      proxy: {
        port: 3000,
        secure: true,
      },
      domains: [{ name: input.domain }],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
        {
          type: "bind",
          hostPath: "/etc/timezone",
          mountPath: "/etc/timezone",
        },
        {
          type: "bind",
          hostPath: "/etc/localtime",
          mountPath: "/etc/localtime",
        },
      ],
      ports: [
        {
          published: 2222,
          target: 22,
        },
      ],
    },
  });

  if (input.databaseType === "postgres") {
    services.push({
      type: "postgres",
      data: {
        projectName: input.projectName,
        serviceName: input.databaseServiceName,
        password: databasePassword,
      },
    });
  }

  if (input.databaseType === "mysql") {
    services.push({
      type: "mysql",
      data: {
        projectName: input.projectName,
        serviceName: input.databaseServiceName,
        password: databasePassword,
      },
    });
  }

  return { services };
}
