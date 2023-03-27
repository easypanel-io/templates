import { Output, randomPassword, Services } from "~templates-utils";
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
        `SQLALCHEMY_DATABASE_URI=postgres://postgres:${databasePassword}@${input.projectName}_${input.databaseServiceName}:5432/${input.projectName}`,
        `ADMIN_USERNAME=${input.adminUsername}`,
        `ADMIN_EMAIL=${input.adminEmail}`,
        `ADMIN_PASSWORD=${input.adminPassword}`,
        `SECRET_KEY=${input.supersetSecretKey}`,
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
