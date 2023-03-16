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
        `HASURA_GRAPHQL_DATABASE_URL=postgres://postgres:${databasePassword}@${input.projectName}_${input.databaseServiceName}:5432/${input.projectName}`,
        `HASURA_GRAPHQL_ENABLE_CONSOLE=${input.enableConsole}`,
        `HASURA_GRAPHQL_DEV_MODE=${input.devMode}`,
        `HASURA_GRAPHQL_ADMIN_SECRET=${input.hasuraAdminSecret}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 8080,
        secure: true,
      },
      domains: [
        {
          name: input.hasuraDomain,
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
