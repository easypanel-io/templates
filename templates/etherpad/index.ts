import {
  Output,
  randomPassword,
  randomString,
  Services
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const etherpadApiKey = randomString(32);

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `DB_TYPE=postgres`,
        `DB_HOST=${input.projectName}_${input.databaseServiceName}`,
        `DB_NAME=${input.databaseServiceName}`,
        `DB_PORT=5432`,
        `DB_USER=postgres`,
        `DB_PASS=${databasePassword}`,
        `ETHERPAD_API_KEY=${etherpadApiKey}`,
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
