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
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: { port: 80, secure: true },
      domains: [{ name: input.domain }],
      env: [
        `APP_BASE_URL=https://${input.domain}`,
        `APP_PORT=80`,
        `DB_CLIENT=pg`,
        `POSTGRES_PASSWORD=${databasePassword}`,
        `POSTGRES_DATABASE=${input.projectName}`,
        `POSTGRES_USER=postgres`,
        `POSTGRES_PORT=5432`,
        `POSTGRES_HOST=${input.projectName}_${input.databaseServiceName}`,
      ].join("\n"),
    },
  });

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
