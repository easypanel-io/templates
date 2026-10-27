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
  const storageAccessKey = input.appServiceName;
  const storageSecretKey = randomPassword();
  const nextAuthSecret = randomString(32);

  const storageServiceName = `${input.appServiceName}-storage`;
  const storageInitServiceName = `${input.appServiceName}-storage-init`;
  const storagePublicUrl = `https://$(PROJECT_NAME)-${storageServiceName}.$(EASYPANEL_HOST)`;
  const appPublicUrl = `https://$(PROJECT_NAME)-${input.appServiceName}.$(EASYPANEL_HOST)`;
  const bucketName = input.appServiceName;

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
      serviceName: storageServiceName,
      source: {
        type: "image",
        image: "rustfs/rustfs:1.0.4",
      },
      env: [
        `RUSTFS_ACCESS_KEY=${storageAccessKey}`,
        `RUSTFS_SECRET_KEY=${storageSecretKey}`,
        `RUSTFS_ADDRESS=0.0.0.0:9000`,
        `RUSTFS_CONSOLE_ADDRESS=0.0.0.0:9001`,
        `RUSTFS_CONSOLE_ENABLE=true`,
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
          name: "storage",
          mountPath: "/data",
        },
      ],
    },
  });

  const bootstrapScript = `#!/bin/sh
set -eu
until curl -fsS "$STORAGE_URL/health" >/dev/null 2>&1; do
  echo "Waiting for storage..."
  sleep 1
done
s3="aws --endpoint-url $STORAGE_URL s3api"
$s3 head-bucket --bucket "$BUCKET_NAME" >/dev/null 2>&1 || $s3 create-bucket --bucket "$BUCKET_NAME"
$s3 put-bucket-cors --bucket "$BUCKET_NAME" --cors-configuration "{\\"CORSRules\\":[{\\"AllowedOrigins\\":[\\"$APP_URL\\"],\\"AllowedMethods\\":[\\"GET\\",\\"HEAD\\",\\"PUT\\"],\\"AllowedHeaders\\":[\\"*\\"],\\"ExposeHeaders\\":[\\"ETag\\"],\\"MaxAgeSeconds\\":3600}]}"
$s3 put-bucket-policy --bucket "$BUCKET_NAME" --policy "{\\"Version\\":\\"2012-10-17\\",\\"Statement\\":[{\\"Effect\\":\\"Allow\\",\\"Principal\\":\\"*\\",\\"Action\\":[\\"s3:GetObject\\"],\\"Resource\\":[\\"arn:aws:s3:::$BUCKET_NAME/*\\"]}]}"
sleep infinity
`;

  services.push({
    type: "app",
    data: {
      serviceName: storageInitServiceName,
      source: {
        type: "image",
        image: "amazon/aws-cli:2.34.30",
      },
      deploy: {
        command: "sh /bootstrap.sh",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 9999,
        },
      ],
      env: [
        `AWS_ACCESS_KEY_ID=${storageAccessKey}`,
        `AWS_SECRET_ACCESS_KEY=${storageSecretKey}`,
        `AWS_DEFAULT_REGION=us-east-1`,
        `AWS_EC2_METADATA_DISABLED=true`,
        `STORAGE_URL=${storagePublicUrl}`,
        `APP_URL=${appPublicUrl}`,
        `BUCKET_NAME=${bucketName}`,
      ].join("\n"),
      mounts: [
        {
          type: "file",
          content: bootstrapScript,
          mountPath: "/bootstrap.sh",
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
        `S3_COMPATIBLE_ACCESS_KEY=${storageAccessKey}`,
        `S3_COMPATIBLE_SECRET_KEY=${storageSecretKey}`,
        `S3_COMPATIBLE_API_URL=${storagePublicUrl}`,
        `S3_COMPATIBLE_PUBLIC_URL=${storagePublicUrl}`,
        `S3_COMPATIBLE_BUCKET=${bucketName}`,
        `GITHUB_ID=${input.githubId || ""}`,
        `GITHUB_SECRET=${input.githubSecret || ""}`,
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
