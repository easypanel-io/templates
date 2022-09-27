import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const hashSalt = randomString();

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
        image: "ghcr.io/umami-software/umami:postgresql-latest",
      },
      domains: [{ name: input.domain }],
      proxy: { port: 3000, secure: true },
      env: [
        `DATABASE_URL=postgres://postgres:${databasePassword}@${input.projectName}_${input.databaseServiceName}:5432/${input.projectName}?sslmode=disable`,
        `DATABASE_TYPE=postgresql`,
        `HASH_SALT=${hashSalt}`,
      ].join("\n"),
    },
  });

  return { services };
}
