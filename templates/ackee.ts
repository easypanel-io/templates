import {
  AppService,
  createTemplate,
  MongoService,
  randomPassword,
} from "~templates-utils";

export default createTemplate({
  name: "Ackee",
  meta: {
    description:
      "Self-hosted, Node.js based analytics tool for those who care about privacy. Ackee runs on your own server, analyzes the traffic of your websites and provides useful statistics in a minimal interface.",
    instructions: "",
    changeLog: [{ date: "2022-06-04", description: "first release" }],
    links: [
      { label: "Website", url: "https://ackee.electerious.com/" },
      { label: "Documentation", url: "https://docs.ackee.electerious.com/" },
      { label: "Github", url: "https://github.com/electerious/Ackee" },
    ],
    contributors: [{ name: "Ponky", url: "https://github.com/Ponkhy" }],
    screenshots: [{ alt: "Dashboard", url: "https://i.imgur.com/Nawj0pp.png" }],
  },
  schema: {
    type: "object",
    required: [
      "projectName",
      "domain",
      "ackeeUsername",
      "ackeePassword",
      "appServiceName",
      "mongoServiceName",
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
      ackeeUsername: {
        type: "string",
        title: "Ackee Username",
      },
      ackeePassword: {
        type: "string",
        title: "Ackee Password",
      },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "ackee",
      },
      mongoServiceName: {
        type: "string",
        title: "MongoDB Service Name",
        default: "mongodb",
      },
    },
  } as const,
  generate({
    projectName,
    domain,
    ackeeUsername,
    ackeePassword,
    appServiceName,
    mongoServiceName,
  }) {
    let mongoPassword = randomPassword();

    const appService: AppService = {
      projectName,
      serviceName: appServiceName,
      env: [
        `WAIT_HOSTS=${projectName}_${mongoServiceName}:27017`,
        `ACKEE_MONGODB=mongodb://mongo:${mongoPassword}@${projectName}_${mongoServiceName}:27017`,
        `ACKEE_USERNAME=${ackeeUsername}`,
        `ACKEE_PASSWORD=${ackeePassword}`,
      ].join("\n"),
      source: {
        type: "image",
        image: "electerious/ackee",
      },
      proxy: {
        port: 3000,
        secure: true,
      },
      domains: [{ name: domain }],
    };

    const mongoService: MongoService = {
      projectName,
      serviceName: mongoServiceName,
      image: "mongo:4",
      password: mongoPassword,
    };

    return {
      services: [
        { type: "app", data: appService },
        { type: "mongo", data: mongoService },
      ],
    };
  },
});
