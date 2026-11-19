import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const databaseAddress = `postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`;

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 7351,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/nakama/data",
        },
      ],
      deploy: {
        command:
          `/bin/sh -ecx "/nakama/nakama migrate up --database.address ${databaseAddress} && ` +
          `exec /nakama/nakama --name nakama1 --database.address ${databaseAddress} --logger.level DEBUG --session.token_expiry_sec 7200"`,
      },
    },
  });

  return { services };
}
