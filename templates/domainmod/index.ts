import {
  AppService,
  createTemplate,
  MySQLService,
  randomPassword,
} from "~templates-utils";

export default createTemplate({
  name: "DomainMod",
  meta: {
    description:
      "DomainMOD is an open source application written in PHP used to manage your domains and other internet assets in a central location. DomainMOD also includes a Data Warehouse framework that allows you to import your web server data so that you can view, export, and report on your live data. Currently the Data Warehouse only supports servers running WHM/cPanel.",
    changeLog: [{ date: "2022-07-12", description: "first release" }],
    links: [
      { label: "Website", url: "https://domainmod.org/" },
      { label: "Documentation", url: "https://domainmod.org/docs/" },
      { label: "Github", url: "https://github.com/domainmod/domainmod/" },
    ],
    contributors: [
      { name: "Mark Topper", url: "https://github.com/marktopper" },
      { name: "Andrei Canta", url: "https://github.com/deiucanta" },
    ],
  },
  schema: {
    type: "object",
    required: [
      "projectName",
      "domain",
      "appServiceName",
      "databaseServiceName",
      "timezone",
    ],
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
      mounts: [
        {
          type: "volume",
          name: "application",
          mountPath: "/var/www/html",
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
