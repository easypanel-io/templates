import { createTemplate, Services, bcryptHash } from "~templates-utils";

export default createTemplate({
  name: "Rocket.Chat",
  meta: {
    description: "Rocket.Chat is an open-source fully customizable communications platform developed in JavaScript for organizations with high standards of data protection. Real-time conversations between colleagues, with other companies or with your customers, regardless of how they connect with you. The result is an increase in productivity and customer satisfaction rates.Every day, tens of millions of users in over 150 countries and in organizations such as Deutsche Bahn, The US Navy, and Credit Suisse trust Rocket.Chat to keep their communications completely private and secure.",
    changeLog: [{ date: "2022-08-10", description: "first release" }],
    links: [
      { label: "Website", url: "https://rocket.chat/" },
      { label: "Documentation", url: "https://docs.rocket.chat/" },
      { label: "Github", url: "https://github.com/RocketChat/Rocket.Chat" },
    ],
    contributors: [
      { name: "Bedeoan Raul", url: "https://github.com/bedeoan" },
      { name: "Andrei Canta", url: "https://github.com/deiucanta" },
    ],
  },
  schema: {
    type: "object",
    required: ["projectName", "serviceName", "dbServiceName", "domain"],
    properties: {
      projectName: {
        type: "string",
        title: "Project Name",
      },
      serviceName: {
        type: "string",
        title: "Service Name",
        default: 'rocketchat'
      },
      dbServiceName: {
        type: "string",
        title: "DB Service Name",
        default: 'rocketchatdb'
      },
      domain: {
        type: "string",
        title: "Domain",
      },
    },
  } as const,
  generate({ projectName, serviceName,dbServiceName, domain }) {
    const services: Services = [];

    services.push({
      type: "app",
      data: {
        projectName,
        serviceName: dbServiceName,
        source: { type: "image", image: "docker.io/bitnami/mongodb:4.4" },
        mounts: [
          {
            type: "volume",
            name: "mongodb_data",
            mountPath: "/bitnami/mongodb",
          },
        ],
        proxy: { port: 80, secure: true },
        deploy: { replicas: 1, command: null, zeroDowntime: true },
        env: [
          `MONGODB_REPLICA_SET_MODE=primary`,
          `MONGODB_REPLICA_SET_NAME=rs0`,
          `MONGODB_PORT_NUMBER=27017`,
          `MONGODB_INITIAL_PRIMARY_HOST=${projectName}_${dbServiceName}`,
          `MONGODB_INITIAL_PRIMARY_PORT_NUMBER=27017`,
          `MONGODB_ADVERTISED_HOSTNAME=${projectName}_${dbServiceName}`,
          `MONGODB_ENABLE_JOURNAL=true`,
          `ALLOW_EMPTY_PASSWORD=true`,
        ].join("\n"),
      },
    });
    services.push({
      type: "app",
      data: {
        projectName,
        serviceName,
        source: { type: "image", image: "rocket.chat" },
        domains: [{ name: domain }],
        proxy: { port: 80, secure: true },
        deploy: { replicas: 1, command: null, zeroDowntime: true },
        env: [
          `MONGO_URL=mongodb://${projectName}_${dbServiceName}:27017/rocketchat?replicaSet=rs0`,
          `MONGO_OPLOG_URL=mongodb://${projectName}_${dbServiceName}:27017/local?replicaSet=rs0`,
        ].join("\n"),
      },
    });
    return { services };
  },
});
