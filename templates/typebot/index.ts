import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secret = randomString(64);
  const databasePassword = randomPassword();
  const minioPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.builderServiceName,
      env: [
        `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`,
        `NEXTAUTH_URL=https://${input.builderDomain}`,
        `NEXT_PUBLIC_VIEWER_URL=${input.viewerDomain}`,
        `ENCRYPTION_SECRET=${secret}`,
        `ADMIN_EMAIL=${input.adminEmail}`,
        `DISABLE_SIGNUP=false`,
        `GITHUB_CLIENT_ID=${input.githubClientId}`,
        `GITHUB_CLIENT_SECRET=${input.githubClientSecret}`,
        `S3_ACCESS_KEY=minio`,
        `S3_SECRET_KEY=${minioPassword}`,
        `S3_BUCKET=typebot`,
        `S3_ENDPOINT=http://$(PROJECT_NAME)_${input.storageServiceName}:9000`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.builderServiceImage,
      },
      domains: [
        {
          host: input.builderDomain,
          port: 3000,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.viewerServiceName,
      env: [
        `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`,
        `NEXT_PUBLIC_VIEWER_URL=${input.viewerDomain}`,
        `ENCRYPTION_SECRET=${secret}`,
        `S3_ACCESS_KEY=minio`,
        `S3_SECRET_KEY=${minioPassword}`,
        `S3_BUCKET=typebot`,
        `S3_ENDPOINT=http://$(PROJECT_NAME)_${input.storageServiceName}:9000`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.viewerServiceImage,
      },
      domains: [
        {
          host: input.viewerDomain,
          port: 3000,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.storageServiceName,
      env: [
        `MINIO_ROOT_USER=minio`,
        `MINIO_ROOT_PASSWORD=${minioPassword}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.storageServiceImage,
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

  services.push({
    type: "postgres",
    data: {
      image: "postgres:13",
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
