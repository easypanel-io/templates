import {
  AppService,
  createTemplate,
  PostgresService,
  MySQLService,
  randomPassword,
} from "~templates-utils";

export default createTemplate({
  name: "Gitea",
  schema: {
    type: "object",
    required: ["projectName", "domain", "appServiceName", "databaseType", "databaseServiceName"],
    properties: {
      projectName: {
        type: "string",
        title: "Project Name",
      },
      domain: {
        type: "string",
        title: "Domain",
      },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "gitea",
      },
      databaseType: {
        type: "string",
        title: "Database Type",
        oneOf: [
          { enum: ["postgres"], title: "Postgres" },
          { enum: ["mysql"], title: "MySQL" },
        ],
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "db",
      },
    },
  } as const,
  generate({
    projectName,
    domain,
    appServiceName,
    databaseType,
    databaseServiceName,
  }) {
    const databasePassword = randomPassword();
    const databaseUsername = databaseType === "postgres" ? "postgres" : "mysql";
    const databasePort = databaseType === "postgres" ? "5432" : "3306";

    const appService: AppService = {
      projectName,
      serviceName: appServiceName,
      env: [
        `USER_UID=1000`,
        `USER_GID=1000`,
        `ROOT_URL=https://${domain}`,
        `GITEA__database__DB_TYPE=${databaseType}`,
        `GITEA__database__HOST=${projectName}_${databaseServiceName}:${databasePort}`,
        `GITEA__database__NAME=${projectName}`,
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
      domains: [{ name: domain }],
      volumes: [
        {
          type: "volume",
          source: "gitea",
          target: "/data",
        },
        {
          type: "bind",
          source: "/etc/timezone",
          target: "/etc/timezone:ro",
        },
        {
          type: "bind",
          source: "/etc/localtime",
          target: "/etc/localtime:ro",
        },
      ],
      ports: [
        {
          published: 2222,
          target: 22,
        },
      ],
    };

    const postgresService: PostgresService = {
      projectName,
      serviceName: databaseServiceName,
      password: databasePassword,
    };

    const mysqlService: MySQLService = {
      projectName,
      serviceName: databaseServiceName,
      password: databasePassword,
    };

    const databaseService = databaseType === "postgres" ? postgresService : mysqlService;

    return {
      services: [
        { type: "app", data: appService },
        { type: databaseType, data: databaseService },
      ],
    };
  },
});
