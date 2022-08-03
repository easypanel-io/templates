import { createTemplate, randomPassword, Services } from "~templates-utils";

export default createTemplate({
  name: "Nextcloud",
  meta: {
    description:
      "The self-hosted productivity platform that keeps you in control",
    changeLog: [{ date: "2022-07-22", description: "first release" }],
    links: [
      { label: "Website", url: "https://nextcloud.com/" },
      { label: "Documentation", url: "https://docs.nextcloud.com/" },
      { label: "Github", url: "https://github.com/nextcloud" },
    ],
    contributors: [
      { name: "Raul Bedeoan", url: "https://github.com/bedeoan" },
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
        default: "nextcloud",
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
    const appEnv = [];

    if (databaseType === "mariadb") {
      appEnv.push(
        `MYSQL_DATABASE=${projectName}`,
        `MYSQL_USER=mariadb`,
        `MYSQL_PASSWORD=${databasePassword}`,
        `MYSQL_HOST=${projectName}_${databaseServiceName}`
      );

      services.push({
        type: "mariadb",
        data: {
          projectName,
          serviceName: databaseServiceName,
          password: databasePassword,
        },
      });
    }

    if (databaseType === "postgres") {
      appEnv.push(
        `POSTGRES_DB=${projectName}`,
        `POSTGRES_USER=postgres`,
        `POSTGRES_PASSWORD=${databasePassword}`,
        `POSTGRES_HOST=${projectName}_${databaseServiceName}`
      );

      services.push({
        type: "postgres",
        data: {
          projectName,
          serviceName: databaseServiceName,
          password: databasePassword,
        },
      });
    }

    if (databaseType === "sqlite") {
      appEnv.push(`SQLITE_DATABASE=${projectName}`);
    }

    services.push({
      type: "app",
      data: {
        projectName,
        serviceName: appServiceName,
        env: appEnv.join("\n"),
        source: {
          type: "image",
          image: "nextcloud",
        },
        proxy: {
          port: 80,
          secure: true,
        },
        domains: [{ name: domain }],
        mounts: [
          {
            type: "volume",
            name: "data",
            mountPath: "/var/www/html",
          },
        ],
      },
    });

    return { services };
  },
});
