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
  const redisPassword = randomPassword();
  const secretKey = randomString(5);

  const common_envs = [
    `PAPERMERGE__SECURITY__SECRET_KEY: ${secretKey}`,
    `PAPERMERGE__AUTH__USERNAME: ${input.username}`,
    `PAPERMERGE__AUTH__PASSWORD: ${input.password}`,
    `PAPERMERGE__DATABASE__URL: postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
    `PAPERMERGE__REDIS__URL: redis://default:${redisPassword}@${input.appServiceName}-redis:6379/0`,
  ].join("\n");

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [common_envs].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-worker`,
      env: [common_envs].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      password: redisPassword,
    },
  });
  return { services };
}
