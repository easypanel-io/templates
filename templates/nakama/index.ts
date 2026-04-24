import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      image: "postgres:12.2-alpine",
      password: input.databasePassword,
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: "nakama",
      source: {
        type: "image",
        image: "registry.heroiclabs.com/heroiclabs/nakama:3.17.1",
      },
      deploy: {
        command: `sh -ecx "/nakama/nakama migrate up --database.address postgres:${input.databasePassword}@${input.projectName}_${input.databaseServiceName}:5432/nakama && exec /nakama/nakama --name nakama1 --database.address postgres:${input.databasePassword}@${input.projectName}_${input.databaseServiceName}:5432/nakama --logger.level DEBUG --session.token_expiry_sec 7200"`,
      },
      mounts: [
        {
          type: "volume",
          name: "nakama-data",
          mountPath: "/nakama/data",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 7351,
        },
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/gateway",
          port: 7350,
        },
      ],
    },
  });

  return { services };
}
