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
        { type: "volume", name: "rabbitmq", mountPath: "/var/lib/rabbitmq" },
      ],
      env: [
        `DB_TYPE=${input.databaseType === "postgres" ? "postgres" : "mysql"}`,
        `DB_HOST=${input.projectName}_${input.databaseServiceName}`,
        `DB_PORT=${input.databaseType === "postgres" ? "5432" : "3306"}`,
        `DB_NAME=${input.projectName}`,
        `DB_USER=${input.databaseType}`,
        `DB_PWD=${databasePassword}`,
        `REDIS_SERVER_HOST=${input.projectName}_${input.redisServiceName}`,
        `REDIS_SERVER_PASS=${redisPassword}`,
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

  return { services };
}
