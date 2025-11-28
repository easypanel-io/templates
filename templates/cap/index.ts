import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const databaseEncryptionKey = randomString(64);
  const nextAuthSecret = randomString(64);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `DATABASE_URL=mysql://mysql:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-mysql:3306/$(PROJECT_NAME)`,
        `WEB_URL=https://$(PRIMARY_DOMAIN)`,
        `NEXTAUTH_URL=https://$(PRIMARY_DOMAIN)`,
        `DATABASE_ENCRYPTION_KEY=${databaseEncryptionKey}`,
        `NEXTAUTH_SECRET=${nextAuthSecret}`,
        `CAP_AWS_ACCESS_KEY=${input.minioAccessKey}`,
        `CAP_AWS_SECRET_KEY=${input.minioSecretKey}`,
        `CAP_AWS_BUCKET=${input.s3BucketName}`,
        `CAP_AWS_REGION=${input.s3Region}`,
        `S3_PUBLIC_ENDPOINT=https://$(PROJECT_NAME)-${input.appServiceName}-minio.$(EASYPANEL_HOST)`,
        `S3_INTERNAL_ENDPOINT=http://$(PROJECT_NAME)_${input.appServiceName}-minio:9000`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
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
    type: "mysql",
    data: {
      serviceName: `${input.appServiceName}-mysql`,
      password: databasePassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-minio`,
      env: [
        `MINIO_API_PORT_NUMBER=3902`,
        `MINIO_CONSOLE_PORT_NUMBER=3903`,
        `MINIO_ROOT_USER=${input.minioAccessKey}`,
        `MINIO_ROOT_PASSWORD=${input.minioSecretKey}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.minioServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 9000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
      deploy: {
        command: `minio server /data --console-address ":9001"`,
      },
    },
  });

  return { services };
}
