import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";
import crypto from "crypto";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const buffer = crypto.randomBytes(32);
  const base64Key = buffer.toString("base64");

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `SQLALCHEMY_DATABASE_URI=postgres://postgres:${databasePassword}@${input.projectName}_${input.databaseServiceName}:5432/${input.projectName}`,
        `ADMIN_USERNAME=${input.adminUsername}`,
        `ADMIN_EMAIL=${input.adminEmail}`,
        `ADMIN_PASSWORD=${input.adminPassword}`,
        `SECRET_KEY=${base64Key}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 8088,
        secure: true,
      },
      domains: [
        {
          name: input.supersetDomain,
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      image: "postgres:13",
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
