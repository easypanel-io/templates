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
  const coreSecret = randomString();

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
      proxy: { port: 3000, secure: true },
      env: [
        `CORE_DATABASE_URL=postgres://postgres:${databasePassword}@${input.projectName}_${input.databaseServiceName}:5432/${input.projectName}?sslmode=disable`,
        `CORE_RETURN_HTTPS=false`,
        `CORE_SECRET=${coreSecret}`,
        `CORE_HOST=0.0.0.0`,
        `CORE_PORT=3000`,
        `CORE_LOGGER=true`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "uploads",
          mountPath: "/zipline/uploads",
        },
        {
          type: "volume",
          name: "public",
          mountPath: "/zipline/public",
        },
      ],
    },
  });

  return { services };
}
