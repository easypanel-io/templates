import {
  Output,
  Services,
  randomPassword,
  randomString,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const databasePassword = randomPassword();
  const redisPassword = randomPassword();
  const nextAuthSecret = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `PORT=3000`,
        `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
        `NEXTAUTH_URL=https://$(PRIMARY_DOMAIN)`,
        `NEXTAUTH_SECRET=${nextAuthSecret}`,
        `AWS_ACCESS_KEY=${input.awsAccessKey}`,
        `AWS_SECRET_KEY=${input.secretKey}`,
        `AWS_DEFAULT_REGION=${input.defaultRegion}`,
        `GITHUB_ID=${input.githubId}`,
        `GITHUB_SECRET=${input.githubSecret}`,
        `REDIS_URL=redis://default:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379`,
        `NEXT_PUBLIC_IS_CLOUD=false`,
        `API_RATE_LIMIT=1`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
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

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-minio`,
      env: [
        "MINIO_SERVER_URL=https://$(EASYPANEL_DOMAIN)",
        `MINIO_ROOT_USER=${input.minioRootUsername}`,
        `MINIO_ROOT_PASSWORD=${input.minioRootPassword}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.minioImage,
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
      domains: [
        {
          host: "console-$(EASYPANEL_DOMAIN)",
          port: 9001,
        },
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 9000,
        },
      ],
      deploy: {
        command: `minio server /data --console-address ":9001"`,
      },
    },
  });

  return { services };
}
