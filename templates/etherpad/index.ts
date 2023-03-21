import {
  Output,
  randomPassword,
  Services
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `DB_TYPE=postgres`,
        `DB_HOST=${input.projectName}_${input.databaseServiceName}`,
        `DB_NAME=${input.projectName}`,
        `DB_PORT=5432`,
        `DB_USER=postgres`,
        `DB_PASS=${databasePassword}`,
        `ETHERPAD_PORT=9001`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 9001,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "base",
          mountPath: "/opt",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
