import {
  AppService,
  createTemplate,
  PostgresService,
  randomPassword,
} from "~templates-utils";

export default createTemplate({
  name: "Statping-ng",
  schema: {
    type: "object",
    required: ["projectName", "domain", "appServiceName", "databaseServiceName"],
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
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "statping-ng_db",
      },
    },
  } as const,
  generate({
    projectName,
    domain,
    appServiceName,
    databaseServiceName,
  }) {
    const databasePassword = randomPassword();

    const appService: AppService = {
      projectName,
      serviceName: appServiceName,
      env: [
        `DB_CONN=postgres`,
        `DB_HOST=${projectName}_${databaseServiceName}`,
        `DB_USER=postgres`,
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
    };

    const postgresService: PostgresService = {
      projectName,
      serviceName: databaseServiceName,
      image: "postgres:alpine",
      password: databasePassword,
    };

    return {
      services: [
        { type: "app", data: appService },
        { type: "postgres", data: postgresService },
      ],
    };
  },
});
