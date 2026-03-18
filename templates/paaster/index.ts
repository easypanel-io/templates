import {
  Output,
  Services,
  randomPassword,
  randomString,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const cookieSecret = randomString(32);
  const mongoPassword = randomPassword();
  const minioUser = "minioadmin";
  const minioPassword = randomPassword();
  const base = `$(PROJECT_NAME)_${input.appServiceName}`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `COOKIE_SECRET=${cookieSecret}`,
        `S3_ENDPOINT=http://${base}-minio:9000`,
        `S3_REGION=us-east-1`,
        `S3_ACCESS_KEY_ID=${minioUser}`,
        `S3_SECRET_ACCESS_KEY=${minioPassword}`,
        `S3_BUCKET=paaster`,
        `S3_FORCE_PATH_STYLE=true`,
        `MONGO_DB=paasterv3`,
        `MONGO_URL=mongodb://mongo:${mongoPassword}@${base}-db:27017/paasterv3?authSource=admin`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
    },
  });

  services.push({
    type: "mongo",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: mongoPassword,
      image: input.mongoImage ?? "mongo:8.2.6",
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-minio`,
      source: {
        type: "image",
        image:
          input.minioImage ??
          "quay.io/minio/minio:RELEASE.2025-07-23T15-54-02Z",
      },
      deploy: {
        command: 'minio server /data --console-address ":9001"',
      },
      env: [
        `MINIO_ROOT_USER=${minioUser}`,
        `MINIO_ROOT_PASSWORD=${minioPassword}`,
      ].join("\n"),
      domains: [
        {
          host: "minio-$(EASYPANEL_DOMAIN)",
          port: 9001,
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

  return { services };
}
