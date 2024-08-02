import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mysqlPassword = randomPassword();
  const jwtSecret = randomString(64);
  const aesKey = randomString(128);

  services.push({
    type: "app",
    data: {
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
        `YAO_DB_PRIMARY=mysql://mysql:${mysqlPassword}@$(PROJECT_NAME)_${input.databaseServiceName}:3306/$(PROJECT_NAME)?charset=utf8mb4&parseTime=True&loc=Local`,
        `YAO_DB_AESKEY=${aesKey}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5099,
        },
      ],
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
    type: "mysql",
    data: { serviceName: input.databaseServiceName, password: mysqlPassword },
  });

  return { services };
}
