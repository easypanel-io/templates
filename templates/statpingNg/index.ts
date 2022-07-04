import { createTemplate, randomPassword, Services } from "~templates-utils";

export default createTemplate({
  name: "Statping-ng",
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
        default: "statping-ng",
      },
      databaseType: {
        type: "string",
        title: "Database Type",
        default: "sqlite",
        oneOf: [
          { enum: ["sqlite"], title: "SQLite" },
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
    const databaseUsername = databaseType;

    services.push({
      type: "app",
      data: {
        projectName,
        serviceName: appServiceName,
        env: [
          `DB_CONN=${databaseType}`,
          `DB_HOST=${projectName}_${databaseServiceName}`,
          `DB_USER=${databaseUsername}`,
          `DB_PASS=${databasePassword}`,
          `DB_DATABASE=${projectName}`,
        ].join("\n"),
        source: {
          type: "image",
          image: "adamboutcher/statping-ng:latest",
        },
        proxy: {
          port: 8080,
          secure: true,
        },
        domains: [{ name: domain }],
        volumes: [
          {
            type: "volume",
            source: "statping_data",
            target: "/app",
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

    if (databaseType === "mysql") {
      services.push({
        type: "mysql",
        data: {
          projectName,
          serviceName: databaseServiceName,
          image: "mysql:5",
          password: databasePassword,
        },
      });
    }

    return { services };
  },
});
