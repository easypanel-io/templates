import {
  AppService,
  createTemplate,
  PostgresService,
  MySQLService,
  randomPassword,
} from "~templates-utils";

export default createTemplate({
  name: "Wiki.js",
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
        default: "wikijs",
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
      `DB_TYPE=${databaseType}`,
      `DB_HOST=${projectName}_${databaseServiceName}`,
      `DB_PORT=${databasePort}`,
      `DB_USER=${databaseUsername}`,
      `DB_PASS=${databasePassword}`,
      `DB_NAME=${projectName}`,
      ].join("\n"),
      source: {
        type: "image",
        image: "ghcr.io/requarks/wiki:2",
      },
      proxy: {
        port: 3000,
        secure: true,
      },
      domains: [{ name: domain }],
    };

    const postgresService: PostgresService = {
      projectName,
      serviceName: databaseServiceName,
      image: "postgres:alpine",
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
