import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();

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
          port: 5212,
        },
      ],
      env: [
        `CR_CONF_Database.Type=postgres`,
        `CR_CONF_Database.Host=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `CR_CONF_Database.User=postgres`,
        `CR_CONF_Database.Password=${databasePassword}`,
        `CR_CONF_Database.Name=$(PROJECT_NAME)`,
        `CR_CONF_Database.Port=5432`,
        `CR_CONF_Redis.Server=$(PROJECT_NAME)_${input.appServiceName}-redis:6379`,
        `CR_CONF_Redis.Password=${redisPassword}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/cloudreve/data",
        },
      ],
    },
  });

  return { services };
}
