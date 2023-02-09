import { Output, randomString, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const passwordPostgres = randomPassword();
  const passwordRedis = randomPassword();
  const jwtSecret = randomString(32);

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      image: "postgres:15",
      password: passwordPostgres,
    },
  });

  services.push({
    type: "redis",
    data: {
      projectName: input.projectName,
      serviceName: input.redisServiceName,
      password: passwordRedis,
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
      proxy: { port: 8080, secure: true },
      env: [
        `DATABASE_URL=postgres://postgres:${passwordPostgres}@${input.projectName}_${input.databaseServiceName}:5432/${input.projectName}`,
        `NC_REDIS_URL=redis://default:${passwordRedis}@${input.projectName}_${input.redisServiceName}:6379`,
        `NC_AUTH_JWT_SECRET=${jwtSecret}`,
        `NC_PUBLIC_URL=https://${input.domain}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "nc_data",
          mountPath: "/usr/app/data",
        },
      ],
    },
  });

  return { services };
}
