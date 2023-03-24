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
      source: { type: "image", image: input.appServiceImage },
      domains: input.domain ? [{ name: input.domain }] : [],
      proxy: { port: 4567, secure: true },
      env: [
        `SETUP=1`,
        `NODEBB_URL=https://${input.domain || "localhost"}`,
        `NODEBB_ADMIN_EMAIL=${input.nodebbAdminMail || "admin@example.com"}`,
        `NODEBB_ADMIN_USERNAME=${input.nodebbAdminUsername || "admin"}`,
        `NODEBB_ADMIN_PASSWORD=${
          input.nodebbAdminPassword || randomPassword()
        }`,
        `NODEBB_DB=${input.databaseServiceType}`,
        `NODEBB_DB_HOST=${input.projectName}_${input.databaseServiceName}`,
        `NODEBB_DB_USER=${
          input.databaseServiceType === "redis"
            ? "default"
            : input.databaseServiceType
        }`,
        `NODEBB_DB_PASSWORD=${databasePassword}`,
        `NODEBB_DB_NAME=${
          input.databaseServiceType === "mongo"
            ? "admin"
            : input.databaseServiceType === "redis"
            ? 0
            : input.projectName
        }`,
      ].join("\n"),
    },
  });

  services.push({
    type: input.databaseServiceType,
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
