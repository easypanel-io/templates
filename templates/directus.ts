import {
  AppService,
  createTemplate,
  PostgresService,
  MySQLService,
  RedisService,
  randomPassword,
  randomString,
} from "~templates-utils";

export default createTemplate({
  name: "Directus",
  schema: {
    type: "object",
    required: ["projectName", "domain", "appServiceName", "adminEmail", "adminPassword", "databaseType", "databaseServiceName", "redisServiceName"],
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
        default: "directus",
      },
      adminEmail: {
        type: "string",
        title: "Admin E-Mail",
        description: "admin@example.com",
      },
      adminPassword: {
        type: "string",
        title: "Admin Password",
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
      redisServiceName: {
        type: "string",
        title: "Redis Service Name",
        default: "redis",
      },
    },
  } as const,
  generate({
    projectName,
    domain,
    appServiceName,
    adminEmail,
    adminPassword = randomPassword(),
    databaseType,
    databaseServiceName,
    appKey = randomString(48),
    appSecret = randomString(48),
    redisServiceName,
  }) {
    let databasePassword = randomPassword();
    let redisPassword = randomPassword();
    let databaseUsername = databaseType == "postgres" ? "postgres" : "mysql";
    let databasePort = databaseType == "postgres" ? "5432" : "3306";

    const appService: AppService = {
      projectName,
      serviceName: appServiceName,
      env: [
        `KEY=${appKey}`,
        `SECRET=${appSecret}`,
        `DB_CLIENT=${databaseType}`,
        `DB_HOST=${projectName}_${databaseServiceName}`,
        `DB_PORT=${databasePort}`,
        `DB_DATABASE=${projectName}`,
        `DB_USER=${databaseUsername}`,
        `DB_PASSWORD=${databasePassword}`,
        `CACHE_ENABLED=true`,
        `CACHE_STORE=redis`,
        `CACHE_REDIS=redis://default:${redisPassword}@${projectName}_${redisServiceName}:6379`,
        `ADMIN_EMAIL=${adminEmail}`,
        `ADMIN_PASSWORD=${adminPassword}`
      ].join("\n"),
      source: {
        type: "image",
        image: "directus/directus:latest",
      },
      proxy: {
        port: 8055,
        secure: true,
      },
      domains: [{ name: domain }],
      volumes: [
        {
          type: "volume",
          source: "uploads",
          target: "/directus/uploads",
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
      image: "mysql:5",
      password: databasePassword,
    };

    const redisService: RedisService = {
      projectName,
      serviceName: redisServiceName,
      password: redisPassword,
    };

    let databaseService = databaseType == "postgres" ? postgresService : mysqlService;

    return {
      services: [
        { type: "app", data: appService },
        { type: databaseType, data: databaseService },
        { type: "redis", data: redisService },
      ],
    };
  },
});
