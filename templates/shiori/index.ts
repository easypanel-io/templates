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
      source: { type: "image", image: input.appServiceImage },
      proxy: { port: 8080, secure: true },
      domains: input.domain ? [{ name: input.domain }] : [],
      env: [
        "SHIORI_DIR=/src/shiori",
        `SHIORI_DBMS=postgresql`,
        `SHIORI_PG_USER=postgres`,
        `SHIORI_PG_PASS=${databasePassword}`,
        `SHIORI_PG_NAME=${input.projectName}`,
        `SHIORI_PG_HOST=${input.projectName}_${input.databaseServiceName}`,
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
