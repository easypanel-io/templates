import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      env: [
        "SHIORI_DIR=/src/shiori",
        `SHIORI_DBMS=postgresql`,
        `SHIORI_PG_USER=postgres`,
        `SHIORI_PG_PASS=${databasePassword}`,
        `SHIORI_PG_NAME=$(PROJECT_NAME)`,
        `SHIORI_PG_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `SHIORI_PG_PORT=5432`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/src/shiori",
        },
      ],
    },
  });

  return { services };
}
