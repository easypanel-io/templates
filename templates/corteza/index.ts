import {
  Output,
  randomPassword,
  randomString,
  Services
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secret = randomString(512);
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `DOMAIN=https://${input.domain}`,
        `AUTH_BASE_URL=https://${input.domain}/auth`,
        `VERSION=2022.9.8`,
        `DB_DSN=postgres://postgres:${databasePassword}@${input.projectName}_${input.databaseServiceName}:5432/${input.projectName}?sslmode=disable`,
        `AUTH_JWT_SECRET=${secret}`,
        `HTTP_WEBAPP_ENABLED=true`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 80,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
      domains: [
        {
          name: input.domain,
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      image: "postgres:13",
      password: databasePassword,
    },
  });

  return { services };
}
