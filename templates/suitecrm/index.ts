import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mariaPassword = randomPassword();
  const appKey = Buffer.from(randomString(32)).toString("base64");

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `SUITECRM_DATABASE_HOST=${input.projectName}_${input.databaseServiceName}`,
        `SUITECRM_DATABASE_PORT_NUMBER=3306`,
        `SUITECRM_DATABASE_NAME=${input.projectName}`,
        `SUITECRM_DATABASE_USER=mariadb`,
        `SUITECRM_DATABASE_PASSWORD=${mariaPassword}`,
        `SUITECRM_ENABLE_HTTPS=yes`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 8443,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "vendor",
          mountPath: "/bitnami/suitecrm",
        },
      ],
    },
  });

  services.push({
    type: "mariadb",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: mariaPassword,
    },
  });

  return { services };
}
