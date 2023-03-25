import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();
  const rabbitmqPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      proxy: { port: 80, secure: true },
      mounts: [
        { type: "volume", name: "logs", mountPath: "/var/log/onlyoffice" },
        { type: "volume", name: "data", mountPath: "/var/www/onlyoffice/Data" },
        { type: "volume", name: "lib", mountPath: "/var/lib/onlyoffice" },
      ],
      env: [
        `DB_TYPE=${input.databaseType}`,
        `DB_HOST=${input.projectName}_${input.databaseServiceName}`,
        `DB_NAME=${input.projectName}`,
        `DB_USER=${input.databaseType}`,
        `DB_PWD=${databasePassword}`,
        `REDIS_SERVER_HOST=${input.projectName}_${input.redisServiceName}`,
        `REDIS_SERVER_PASS=${redisPassword}`,
        `AMQP_URI=amqp://rabbitmq:${rabbitmqPassword}@${input.projectName}_${input.rabbitmqServiceName}`,
        `JWT_SECRET=${randomString(64)}`,
      ].join("\n"),
    },
  });

  services.push({
    type: input.databaseType,
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
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
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.rabbitmqServiceName,
      source: { type: "image", image: "rabbitmq:3" },
      mounts: [
        { type: "volume", name: "data", mountPath: "/var/lib/rabbitmq" },
        { type: "volume", name: "config", mountPath: "/etc/rabbitmq" },
      ],
      env: [
        `RABBITMQ_DEFAULT_USER=rabbitmq`,
        `RABBITMQ_DEFAULT_PASS=${rabbitmqPassword}`,
      ].join("\n"),
    },
  });

  return { services };
}
