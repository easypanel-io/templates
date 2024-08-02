import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const dbHost =
    input.databaseType === "external"
      ? input.databaseServiceName
      : `$(PROJECT_NAME)_${input.databaseServiceName}`;
  // const dbPort = input.databasePort || input.databaseType === 'postgres' ? 5432 : 3306
  const dbPort = input.databasePort || 3306;
  const dbName = input.databaseName || "$(PROJECT_NAME)";
  const dbUser = input.databaseUser || input.databaseType;
  const dbRandomPassword = input.databaseUserPassword || randomPassword();

  const serviceVariables = [
    `FLARUM_BASE_URL=https://$(PRIMARY_DOMAIN)`,
    `FLARUM_FORUM_TITLE=Flarum`,
    `DB_HOST=${dbHost}`,
    `DB_PORT=${dbPort}`,
    `DB_NAME=${dbName}`,
    `DB_USER=${dbUser}`,
    `DB_PASSWORD=${dbRandomPassword}`,
  ];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: serviceVariables.join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
    },
  });

  if (input.databaseType !== "external") {
    services.push({
      type: input.databaseType,
      data: {
        serviceName: input.databaseServiceName,
        password: dbRandomPassword,
      },
    });
  }

  return { services };
}
