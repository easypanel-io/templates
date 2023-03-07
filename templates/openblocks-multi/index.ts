import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const passwordMongo = randomPassword();
  const passwordRedis = randomPassword();
  const encryptPassword = randomPassword();
  const encryptSalt = randomString(10);

  services.push({
    type: "redis",
    data: {
      projectName: input.projectName,
      serviceName: input.redisServiceName,
      password: passwordRedis,
    },
  });

  services.push({
    type: "mongo",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      image: "mongo:6",
      password: passwordMongo,
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: `${input.appServiceName}-api-service`,
      source: {
        type: "image",
        image: `openblocksdev/openblocks-ce-api-service:${input.appServiceImage}`,
      },
      env: [
        `MONGODB_URI=mongodb://mongo:${passwordMongo}@${input.projectName}_${input.databaseServiceName}:27017/${input.databaseServiceName}?authSource=admin`,
        `REDIS_URI=redis://default:${passwordRedis}@${input.projectName}_${input.redisServiceName}:6379`,
        `JS_EXECUTOR_URI=http://${input.appServiceName}-node-service:6060`,
        `ENABLE_USER_SIGN_UP: "true"`,
        `ENCRYPTION_PASSWORD: ${encryptPassword}`,
        `ENCRYPTION_SALT: ${encryptSalt}`,
        `CORS_ALLOWED_DOMAINS: "*"`,
      ].join("\n"),
      proxy: { port: 8080, secure: false },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/usr/app/data",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: `${input.appServiceName}-node-service`,
      source: {
        type: "image",
        image: `openblocksdev/openblocks-ce-node-service:${input.appServiceImage}`,
      },
      proxy: { port: 6060, secure: false },
      env: [
        `OPENBLOCKS_API_SERVICE_URL: http://${input.appServiceName}-api-service:8080`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/usr/app/data",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: `openblocksdev/openblocks-ce-frontend:${input.appServiceImage}`,
      },
      proxy: { port: 3000, secure: true },
      env: [
        `OPENBLOCKS_API_SERVICE_URL: http://${input.appServiceName}-api-service:8080`,
        `OPENBLOCKS_NODE_SERVICE_URL: http://${input.appServiceName}-node-service:6060`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/usr/app/data",
        },
      ],
    },
  });

  return { services };
}
