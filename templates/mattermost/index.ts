import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: "mattermost/mattermost-team-edition:7.1",
      },
      mounts: [
        { type: "volume", name: "mattermost", mountPath: "/mattermost" },
      ],
      domains: [{ name: input.domain }],
      proxy: { port: 8065, secure: true },
      deploy: { replicas: 1, command: null, zeroDowntime: true },
      env: [
        `MM_SQLSETTINGS_DRIVERNAME=postgres`,
        `MM_SQLSETTINGS_DATASOURCE=postgres://postgres:${databasePassword}@${input.projectName}_${input.databaseServiceName}:5432/${input.projectName}?sslmode=disable`,
      ].join("\n"),
    },
  });

  return { services };
}
