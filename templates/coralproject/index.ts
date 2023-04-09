import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secretkey = randomString(32);
  const redisPassword = randomPassword();
  const mongoPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `MONGODB_URI=mongodb://mongo:${mongoPassword}@${input.projectName}_${input.databaseServiceName}:27017`,
        `REDIS_URI=redis://default:${redisPassword}@${input.projectName}_${input.redisServiceName}:6379`,
        `SIGINING_SECRET=${secretkey}`,
        `NODE_ENV=production`,
        `PORT=3000`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 3000,
        secure: true,
      },
    },
  });

  services.push({
    type: "redis",
    data: {
      projectName: input.projectName,
      serviceName: input.redisServiceName,
      password: redisPassword,
    },
  });

  services.push({
    type: "mongo",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: mongoPassword,
    },
  });

  return { services };
}
