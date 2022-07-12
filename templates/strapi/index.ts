import {
  Services,
  createTemplate,
  randomPassword,
} from "~templates-utils";

export default createTemplate({
  name: "Strapi",
  meta: {
    description:
      "Strapi enables content-rich experiences to be created, managed and exposed to any digital product, channel or device.",
    changeLog: [{ date: "2022-07-12", description: "first release" }],
    links: [
      { label: "Website",  url: "https://strapi.io/" },
      { label: "Documentation", url: "https://docs.strapi.io/developer-docs/latest/getting-started/introduction.html" },
      { label: "Github", url: "https://github.com/strapi" },
    ],
    contributors: [
      { name: "Ponky", url: "https://github.com/Ponkhy" },
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
      "databaseServiceName",
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
        default: "strapi",
      },
      databaseType: {
        type: "string",
        title: "Database Type",
        default: "sqlite",
        oneOf: [
          { enum: ["sqlite"], title: "SQLite" },
          { enum: ["postgres"], title: "Postgres" },
          { enum: ["mysql"], title: "MariaDB" },
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
    databaseServiceName
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
          `DATABASE_CLIENT=${databaseType}`,
          `DATABASE_HOST=${projectName}_${databaseServiceName}`,
          `DATABASE_PORT=${databasePort}`,
          `DATABASE_NAME=${projectName}`,
          `DATABASE_USERNAME=${databaseUsername}`,
          `DATABASE_PASSWORD=${databasePassword}`,
          `DATABASE_SSL=false`,
        ].join("\n"),
        source: {
          type: "image",
          image: "strapi/strapi",
        },
        proxy: {
          port: 1337,
          secure: true,
        },
        domains: [{ name: domain }],
        volumes: [
          {
            type: "volume",
            source: "app",
            target: "/srv/app",
          },
        ],
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
          image: "mariadb:latest",
          password: databasePassword,
        },
      });
    }

    return { services };
  },
});
