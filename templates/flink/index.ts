import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `DbConfiguration__DbType=Postgres`,
        `DbConfiguration__PostgresConnectionString=Server=$(PROJECT_NAME)_${input.appServiceName}-db;Port=5432;Database=flink;User Id=postgres;Password=${databasePassword};`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      databaseName: "flink",
      password: databasePassword,
    },
  });

  return { services };
}
