import {
  Services,
  createTemplate,
  randomPassword,
} from "~templates-utils";

export default createTemplate({
  name: "Miniflux",
  schema: {
    type: "object",
    required: [
      "projectName",
      "domain",
      "adminUsername",
      "adminPassword",
      "appServiceName",
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
      adminUsername: {
        type: "string",
        title: "Admin Username",
      },
      adminPassword: {
        type: "string",
        title: "Admin Password",
      },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "miniflux",
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
    adminUsername,
    adminPassword,
    appServiceName,
    databaseServiceName
  }) {
    const services: Services = [];
    const databasePassword = randomPassword();

    services.push({
      type: "app",
      data: {
        projectName,
        serviceName: appServiceName,
        env: [
          `DATABASE_URL=postgres://postgres:${databasePassword}@${projectName}_${databaseServiceName}/${projectName}?sslmode=disable`,
          `RUN_MIGRATIONS=1`,
          `CREATE_ADMIN=1`,
          `ADMIN_USERNAME=${adminUsername}`,
          `ADMIN_PASSWORD=${adminPassword}`,
        ].join("\n"),
        source: {
          type: "image",
          image: "miniflux/miniflux:latest",
        },
        proxy: {
          port: 80,
          secure: true,
        },
        domains: [{ name: domain }],
      }
    });

    services.push({
      type: "postgres",
      data: {
        projectName,
        serviceName: databaseServiceName,
        password: databasePassword,
      },
    });

    return { services };
  },
});
