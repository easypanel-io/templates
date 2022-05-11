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
    required: ["projectName", "domain", "ackeeUsername", "ackeePassword", "appServiceName", "mongoServiceName"],
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
