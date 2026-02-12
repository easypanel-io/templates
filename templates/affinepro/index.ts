import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();

  const appEnv = [
    `REDIS_SERVER_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
    `REDIS_SERVER_PASSWORD=${redisPassword}`,
    `DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
    `AFFINE_SERVER_HOST=$(PRIMARY_DOMAIN)`,
  ];

  if (input.mailerHost) {
    appEnv.push(
      `#SMTP CONFIGURATION`,
      `MAILER_HOST=${input.mailerHost}`,
      `MAILER_PORT=${input.mailerHostPort || "587"}`,
      `MAILER_USER=${input.mailerHostUser || ""}`,
      `MAILER_PASSWORD=${input.mailerPassword || ""}`,
      `MAILER_SENDER=${input.mailerSender || ""}`
    );
  }

  const common_envs = appEnv.join("\n");

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
          port: 3010,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "storage",
          mountPath: "/root/.affine/storage",
        },
        {
          type: "volume",
          name: "config",
          mountPath: "/root/.affine/config",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-migration`,
      env: [common_envs].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3010,
        },
      ],
      deploy: {
        command: "node ./scripts/self-host-predeploy.js",
      },
      mounts: [
        {
          type: "volume",
          name: "storage",
          mountPath: "/root/.affine/storage",
        },
        {
          type: "volume",
          name: "config",
          mountPath: "/root/.affine/config",
        },
      ],
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
