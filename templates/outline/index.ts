import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const appKey = randomString(64);
  const appUtilsSecret = randomString(64);
  const databasePassword = randomPassword();
  const minioPassword = randomPassword();
  const redisPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `PGSSLMODE=disable`,
        `SECRET_KEY=${appKey}`,
        `UTILS_SECRET=${appUtilsSecret}`,
        `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)?sslmode=disable`,
        `REDIS_URL=redis://default:${redisPassword}@$(PROJECT_NAME)_${input.redisServiceName}:6379`,
        `DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `URL=https://${input.domainURL || "$(EASYPANEL_DOMAIN)"}`,
        `PORT=3000`,
        `AWS_ACCESS_KEY_ID=minio`,
        `AWS_REGION=us-east-1`,
        `AWS_SECRET_ACCESS_KEY=${minioPassword}`,
        `AWS_S3_UPLOAD_BUCKET_URL=http://$(PROJECT_NAME)_minio:9000`,
        `AWS_S3_UPLOAD_BUCKET_NAME=wiki`,
        `AWS_S3_UPLOAD_MAX_SIZE=26214400`,
        `AWS_S3_FORCE_PATH_STYLE=true`,
        `AWS_S3_ACL=private`,
        `GOOGLE_ALLOWED_DOMAINS=gmail.com`,
        `GOOGLE_CLIENT_ID=${input.googleClient}`,
        `GOOGLE_CLIENT_SECRET=${input.googleClientSecret}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: `sh -c "yarn db:migrate --env=production-ssl-disabled && yarn start --env=production-ssl-disabled"`,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  services.push({
    type: "redis",
    data: { serviceName: input.redisServiceName, password: redisPassword },
  });
  services.push({
    type: "app",
    data: {
      serviceName: input.minioServiceName,
      env: [
        `MINIO_ROOT_USER=minio`,
        `MINIO_ROOT_PASSWORD=${minioPassword}`,
      ].join("\n"),
      source: {
        type: "image",
        image: "bitnami/minio:2022.12.12",
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
          host: "$(EASYPANEL_DOMAIN)",
          port: 9001,
        },
      ],
    },
  });

  return { services };
}
