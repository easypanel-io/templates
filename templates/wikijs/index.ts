import {
  Services,
  createTemplate,
  randomPassword,
} from "~templates-utils";

export default createTemplate({
  name: "Wiki.js",
  meta: {
    description:
      "Extensible open source Wiki software.Make documentation a joy to write using Wiki.js's beautiful and intuitive interface! Works on virtually any platform and is compatible with either PostgreSQL, MySQL, MariaDB, MS SQL Server or SQLite! Running on the blazing fast Node.js engine, Wiki.js is built with performance in mind.",
    changeLog: [{ date: "2022-07-12", description: "first release" }],
    links: [
      { label: "Website",  url: "https://js.wiki/" },
      { label: "Documentation", url: "https://docs.requarks.io/" },
      { label: "Github", url: "https://github.com/Requarks/wiki" },
    ],
    contributors: [
      { name: "Andrei Canta", url: "https://github.com/deiucanta" }
    ],
  },
  schema: {
    type: "object",
    required: [
      "projectName",
      "domain",
      "appServiceName",
      "databaseType",
      "databaseServiceName"
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
        default: "wikijs",
      },
      databaseType: {
        type: "string",
        title: "Database Type",
        default: "postgres",
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
    const services: Services = [];
    const databasePassword = randomPassword();
    const databaseUsername = databaseType === "postgres" ? "postgres" : "mysql";
    const databasePort = databaseType === "postgres" ? "5432" : "3306";

    services.push({
      type: "app",
      data: {
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
      }
    });

    if (databaseType === "postgres") {
      services.push({
        type: "postgres",
        data: {
          projectName,
          serviceName: databaseServiceName,
          password: databasePassword,
        },
      });
    }

    if (databaseType === "mysql") {
      services.push({
        type: "mysql",
        data: {
          projectName,
          serviceName: databaseServiceName,
          password: databasePassword,
        },
      });
    }

    return { services };
  },
});
