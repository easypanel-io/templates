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
        image: input.appServiceImage,
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/mattermost/data",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/mattermost/logs",
        },
        {
          type: "volume",
          name: "config",
          mountPath: "/mattermost/config",
        },
        {
          type: "volume",
          name: "plugins",
          mountPath: "/mattermost/plugins",
        },
        {
          type: "volume",
          name: "client-plugins",
          mountPath: "/mattermost/client/plugins",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8065,
        },
      ],
      deploy: { replicas: 1, command: null, zeroDowntime: true },
      env: [
        `MM_SQLSETTINGS_DRIVERNAME=postgres`,
        `MM_SQLSETTINGS_DATASOURCE=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)?sslmode=disable`,
        `DOMAIN=https://$(PRIMARY_DOMAIN)`,
      ].join("\n"),
    },
  });

  return { services };
}
