import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secret = randomString(32);
  const databasePassword = randomPassword();
  const minioPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.builderServiceName,
      source: { type: "image", image: input.builderServiceImage },
      domains: [{ host: input.builderDomain, port: 3000 }],
      env: [
        `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`,
        `NEXTAUTH_URL=https://${input.builderDomain}`,
        `NEXT_PUBLIC_VIEWER_URL=https://${input.viewerDomain}`,
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
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.viewerServiceName,
      source: { type: "image", image: input.viewerServiceImage },
      domains: [{ host: input.viewerDomain, port: 3000 }],
      env: [
        `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`,
        `NEXTAUTH_URL=https://${input.builderDomain}`,
        `NEXT_PUBLIC_VIEWER_URL=https://${input.viewerDomain}`,
        `ENCRYPTION_SECRET=${secret}`,
        `S3_ACCESS_KEY=minio`,
        `S3_SECRET_KEY=${minioPassword}`,
        `S3_BUCKET=typebot`,
        `S3_ENDPOINT=http://$(PROJECT_NAME)_${input.storageServiceName}:9000`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.storageServiceName,
      source: { type: "image", image: input.storageServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 9001 }],
      mounts: [{ type: "volume", name: "data", mountPath: "/data" }],
      env: [
        `MINIO_ROOT_USER=minio`,
        `MINIO_ROOT_PASSWORD=${minioPassword}`,
      ].join("\n"),
    },
  });

  services.push({
    type: "postgres",
    data: {
      image: "postgres:13",
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
