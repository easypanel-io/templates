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
      image: input.mongoImage,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-minio`,
      source: {
        type: "image",
        image: "chrislusf/seaweedfs:4.48",
      },
      deploy: {
        command:
          "/entrypoint.sh mini -dir=/data -s3.port=9000 -bucket=paaster -master.telemetry=false -admin.ui=false",
      },
      env: [
        `AWS_ACCESS_KEY_ID=${minioUser}`,
        `AWS_SECRET_ACCESS_KEY=${minioPassword}`,
      ].join("\n"),
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
    },
  });

  return { services };
}
