import {
  AppService,
  createTemplate,
  MySQLService,
  randomPassword,
} from "~templates-utils";

export default createTemplate({
  name: "DomainMod",
  schema: {
    type: "object",
    required: ["projectName", "domain", "appServiceName", "databaseServiceName", "timezone"],
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
        default: "domainmod",
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "db",
      },
      timezone: {
        type: "string",
        title: "Timezone",
        default: "Europe/Copenhagen",
      },
    },
  } as const,
  generate({
    projectName,
    domain,
    appServiceName,
    databaseServiceName,
    timezone,
  }) {
    const databasePassword = randomPassword();

    const appService: AppService = {
      projectName,
      serviceName: appServiceName,
      env: [
        `USER_UID=1000`,
        `USER_GID=1000`,
        `TZ=${timezone}`,
        `ROOT_URL=https://${domain}`,
        `DOMAINMOD_WEB_ROOT=`,
        `DOMAINMOD_DATABASE_HOST=${projectName}_${databaseServiceName}`,
        `DOMAINMOD_DATABASE=domainmod`,
        `DOMAINMOD_USER=mysql`,
        `DOMAINMOD_PASSWORD=${databasePassword}`,
      ].join("\n"),
      source: {
        type: "image",
        image: "domainmod/domainmod",
      },
      proxy: {
        port: 80,
        secure: true,
      },
      domains: [{ name: domain }],
      volumes: [
        {
          type: "volume",
          source: "application",
          target: "/var/www/html",
        },
      ],
      ports: [],
    };

    const databaseService: MySQLService = {
      projectName,
      serviceName: databaseServiceName,
      password: databasePassword,
      image: "mysql:5.7",
    };

    return {
      services: [
        { type: "app", data: appService },
        { type: "mysql", data: databaseService },
      ],
    };
  },
});
