import {
  Output,
  Services,
  randomPassword,
  randomString,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const redisPassword = randomPassword();
  const databasePassword = randomPassword();

  const appEnv = [
    `SECRET_KEY=${randomString(32)}`,
    `DATABASE_URL=postgres://postgres:${databasePassword}@${input.projectName}_${input.databaseServiceName}:5432/${input.projectName}`,
    `REDIS_URL=redis://default:${redisPassword}@${input.projectName}_${input.redisServiceName}:6379`,
    `ENABLE_USER_REGISTRATION=${input.enableUserRegistration}`,
    `ENABLE_ORGANIZATION_CREATION=${input.enableOrganizationCreation}`,
  ];
  if (input.domain) appEnv.push(`GLITCHTIP_DOMAIN=https://${input.domain}`);

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: input.domain ? [{ name: input.domain }] : [],
      proxy: { port: 80, secure: true },
      env: appEnv.join("\n"),
      mounts: [{ type: "volume", name: "uploads", mountPath: "/code/uploads" }],
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
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
          hostPath: `/etc/easypanel/projects/${input.projectName}/${input.appServiceName}/volumes/uploads/`,
        },
      ],
    },
  });

  services.push({
    type: "redis",
    data: {
      projectName: input.projectName,
      serviceName: input.redisServiceName,
      password: redisPassword,
    },
  });

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
