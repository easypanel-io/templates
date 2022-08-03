import { createTemplate, randomPassword, Services } from "~templates-utils";

export default createTemplate({
  name: "Strapi",
  meta: {
    description:
      "Strapi enables content-rich experiences to be created, managed and exposed to any digital product, channel or device.Connect your favorite databases, frontend frameworks, or static site generators. Choose where you want to host your websites. Integrate with your favorite tools, and work with the best of each world. No vendor lock-in.",
    changeLog: [{ date: "2022-07-12", description: "first release" }],
    links: [
      { label: "Website", url: "https://strapi.io/" },
      {
        label: "Documentation",
        url: "https://docs.strapi.io/developer-docs/latest/getting-started/introduction.html",
      },
      { label: "Github", url: "https://github.com/strapi" },
    ],
    contributors: [
      { name: "Ponky", url: "https://github.com/Ponkhy" },
      { name: "Andrei Canta", url: "https://github.com/deiucanta" },
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
          { enum: ["mariadb"], title: "MariaDB" },
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
    const databaseClient = databaseType === "mariadb" ? "mysql" : databaseType;
    const databaseUsername =
      databaseType === "postgres" ? "postgres" : "mariadb";
    const databasePort = databaseType === "postgres" ? "5432" : "3306";

    services.push({
      type: "app",
      data: {
        projectName,
        serviceName: appServiceName,
        env: [
          `DATABASE_CLIENT=${databaseClient}`,
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
        mounts: [
          {
            type: "volume",
            name: "app",
            mountPath: "/srv/app",
          },
        ],
      },
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

    if (databaseType === "mariadb") {
      services.push({
        type: "mariadb",
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
