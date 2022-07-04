import {
  createTemplate,
  Services,
  randomPassword
} from "~templates-utils";

export default createTemplate({
  name: "Bookstack",
  schema: {
    type: "object",
    required: [
      "projectName",
      "serviceName",
      "domain",
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
      serviceName: {
        type: "string",
        title: "Service Name",
        default: "bookstack",
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
    serviceName,
    domain,
    databaseServiceName,
  }) {
    const services: Services = [];
    const databasePassword = randomPassword();

    services.push({
      type: "app",
      data: {
        projectName,
        serviceName: serviceName,
        env: [
          `APP_URL=https://${domain}`,
          `DB_HOST=${projectName}_${databaseServiceName}`,
          `DB_USER=mysql`,
          `DB_PASS=${databasePassword}`,
          `DB_DATABASE=${projectName}`,
        ].join("\n"),
        source: {
          type: "image",
          image: "lscr.io/linuxserver/bookstack",
        },
        proxy: {
          port: 80,
          secure: true,
        },
        domains: [{ name: domain }],
        volumes: [
          {
            type: "volume",
            source: "config",
            target: "/config",
          },
        ],
      },
    });

    services.push({
      type: "mysql",
      data: {
        projectName,
        serviceName: databaseServiceName,
        image: "mariadb:latest",
        password: databasePassword,
      },
    });

    return { services };
  },
});
