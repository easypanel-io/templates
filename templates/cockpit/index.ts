import { Output, randomPassword, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mongoPassword = randomPassword();
  const databaseSalt = randomString(32);

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `COCKPIT_SESSION_NAME=cockpit`,
        `COCKPIT_SALT=${databaseSalt}`,
        `COCKPIT_DATABASE_SERVER=mongodb://mongo:${mongoPassword}@${input.projectName}_${input.databaseServiceName}:27017`,
        `COCKPIT_DATABASE_NAME=${input.projectName}`
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 80,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "html",
          mountPath: "/var/www/html"
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/var/www/html/storage/data",
        },
      ],
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
