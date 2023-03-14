import { Output, randomPassword, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mysqlPassword = randomPassword();
  const jwtSecret = randomString(64);
  const aesKey = randomString(128);

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `YAO_ENV=production`,
        `YAO_ROOT=/data/app`,
        `YAO_HOST=127.0.0.1`,
        `YAO_PORT=5099`,
        `YAO_LOG=/data/app/logs/application.log`,
        `YAO_LOG_MODE=TEXT`,
        `YAO_JWT_SECRET=${jwtSecret}`,
        `YAO_DB_DRIVER=mysql`,
        `YAO_DB_PRIMARY=mysql://mysql:${mysqlPassword}@${input.projectName}_${input.databaseServiceName}:3306/${input.projectName}?charset=utf8mb4&parseTime=True&loc=Local`,
        `YAO_DB_AESKEY=${aesKey}`
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 5099,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
    },
  });

  services.push({
    type: input.databaseType,
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: mysqlPassword,
    },
  });

  return { services };
}
