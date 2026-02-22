import { Output, Services, randomPassword, randomString } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const dbPassword = randomPassword();
  const redisPassword = randomPassword();
  const secretKey = randomString(32);

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
          port: 8088,
        },
      ],
      env: [
        `SUPERSET_SECRET_KEY=${secretKey}`,
        `POSTGRES_DB=$(PROJECT_NAME)`,
        `POSTGRES_USER=postgres`,
        `POSTGRES_PASSWORD=${dbPassword}`,
        `POSTGRES_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `POSTGRES_PORT=5432`,
        `REDIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
        `REDIS_PORT=6379`,
        `REDIS_PASSWORD=${redisPassword}`,
        `SUPERSET_LOAD_EXAMPLES=yes`,
        `SUPERSET_ENABLE_PROXY_FIX=true`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "superset",
          mountPath: "/app/superset_home",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: dbPassword,
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