import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const redisPassword = randomPassword();
  const databasePassword = randomPassword();

  const appEnv = [
    `SECRET_KEY=${randomString(32)}`,
    `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`,
    `REDIS_URL=redis://default:${redisPassword}@$(PROJECT_NAME)_${input.redisServiceName}:6379`,
    `ENABLE_USER_REGISTRATION=${input.enableUserRegistration}`,
    `ENABLE_ORGANIZATION_CREATION=${input.enableOrganizationCreation}`,
    `GLITCHTIP_DOMAIN=https://$(PRIMARY_DOMAIN)`,
  ];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      env: appEnv.join("\n"),
      mounts: [{ type: "volume", name: "uploads", mountPath: "/code/uploads" }],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName + "-worker",
      source: { type: "image", image: input.appServiceImage },
      env: appEnv.join("\n"),
      deploy: {
        command: `./manage.py migrate && ./bin/run-celery-with-beat.sh`,
      },
      mounts: [
        {
          type: "bind",
          mountPath: "/code/uploads",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}/volumes/uploads/`,
        },
      ],
    },
  });

  services.push({
    type: "redis",
    data: { serviceName: input.redisServiceName, password: redisPassword },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
