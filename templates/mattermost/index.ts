import { createTemplate, randomPassword, Services } from "~templates-utils";

export default createTemplate({
  name: "Mattermost",
  meta: {
    description:
      "Open source platform for developer collaboration. Secure, flexible, and integrated with the tools you love.",
    changeLog: [{ date: "2022-07-12", description: "first release" }],
    links: [
      { label: "Website", url: "https://mattermost.com/" },
      { label: "Github", url: "https://github.com/mattermost/" },
    ],
    contributors: [
      { name: "Bedeoan Raul", url: "https://github.com/bedeoan" },
      { name: "Andrei Canta", url: "https://github.com/deiucanta" },
    ],
  },
  schema: {
    type: "object",
    required: ["projectName", "domain", "serviceName", "dbName"],
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
        default: "mattermost",
      },
      dbName: {
        type: "string",
        title: "Postgres Database Name",
      },
    },
  } as const,
  generate({ projectName, serviceName, domain, dbName }) {
    const services: Services = [];
    const databasePassword = randomPassword();

    services.push({
      type: "postgres",
      data: {
        projectName,
        serviceName: dbName,
        password: databasePassword,
      },
    });

    services.push({
      type: "app",
      data: {
        projectName,
        serviceName,
        source: {
          type: "image",
          image: "mattermost/mattermost-team-edition:7.1",
        },
        mounts: [
          { type: "volume", name: "mattermost", mountPath: "/mattermost" },
        ],
        domains: [{ name: domain }],
        proxy: { port: 8065, secure: true },
        deploy: { replicas: 1, command: null, zeroDowntime: true },
        env: [
          `MM_SQLSETTINGS_DRIVERNAME=postgres`,
          `MM_SQLSETTINGS_DATASOURCE=postgres://postgres:${databasePassword}@${projectName}_${dbName}:5432/${projectName}?sslmode=disable`,
        ].join("\n"),
      },
    });
    return { services };
  },
});
