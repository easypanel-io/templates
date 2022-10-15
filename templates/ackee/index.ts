import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mongoPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `WAIT_HOSTS=${input.projectName}_${input.databaseServiceName}:27017`,
        `ACKEE_MONGODB=mongodb://mongo:${mongoPassword}@${input.projectName}_${input.databaseServiceName}:27017`,
        `ACKEE_USERNAME=${input.ackeeUsername}`,
        `ACKEE_PASSWORD=${input.ackeePassword}`,
      ].join("\n"),
      source: {
        type: "image",
        image: "electerious/ackee",
      },
      proxy: {
        port: 3000,
        secure: true,
      },
    },
  });

  services.push({
    type: "mongo",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      image: "mongo:4",
      password: mongoPassword,
    },
  });

  return { services };
}
