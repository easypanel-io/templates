import {
  AppService,
  createTemplate,
  randomPassword,
  MongoService,
} from "~templates-utils";

export default createTemplate({
  name: "Ackee",
  schema: {
    type: "object",
    required: ["projectName", "domain", "ackeeUsername" ,"appServiceName", "mongoServiceName"],
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
        description: "Leave empty to generate a random one. (Needs to be copied from the 'Environment' tab)",
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
      mongoPassword: {
        type: "string",
        title: "MongoDB Password",
        description: "Leave empty to generate a random one.",
      },
    },
  } as const,
  generate({
    projectName,
    domain,
    ackeeUsername,
    ackeePassword = randomPassword(),
    appServiceName,
    mongoServiceName,
    mongoPassword = randomPassword(),
  }) {
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
      image: "mongo:4.4.13",
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
