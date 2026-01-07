import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const postgresPassword = randomPassword();
  const redisPassword = randomPassword();
  const minioPassword = randomPassword();
  const nextAuthSecret = randomString(32);

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: postgresPassword,
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
      serviceName: `${input.appServiceName}-storage`,
      source: {
        type: "image",
        image: "minio/minio:latest",
      },
      env: [
        `MINIO_ROOT_USER=unsend`,
        `MINIO_ROOT_PASSWORD=${minioPassword}`,
      ].join("\n"),
      deploy: {
        command:
          'sh -c \'mkdir -p /data/unsend && minio server /data --console-address ":9001" --address ":9002"\'',
      },
      domains: [
        {
          host: "storage-$(EASYPANEL_DOMAIN)",
          port: 9002,
        },
        {
          host: "console-$(EASYPANEL_DOMAIN)",
          port: 9001,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "storage",
          mountPath: "/data",
        },
      ],
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
      env: [
        `PORT=3000`,
        `DATABASE_URL=postgresql://postgres:${postgresPassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
        `NEXTAUTH_URL=https://$(PRIMARY_DOMAIN)`,
        `NEXTAUTH_SECRET=${nextAuthSecret}`,
        `AWS_ACCESS_KEY=${input.awsAccessKey}`,
        `AWS_SECRET_KEY=${input.awsSecretKey}`,
        `AWS_DEFAULT_REGION=us-east-1`,
        `GITHUB_ID=${input.githubId}`,
        `GITHUB_SECRET=${input.githubSecret}`,
        `REDIS_URL=redis://:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379`,
        `NEXT_PUBLIC_IS_CLOUD=false`,
        `API_RATE_LIMIT=${input.apiRateLimit || "60"}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
    },
  });

  return { services };
}
