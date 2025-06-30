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
  const minioRootUser = "minioadmin";
  const minioRootPassword = randomPassword();
  const chromeToken = randomString(32);
  const accessTokenSecret = randomString(64);
  const refreshTokenSecret = randomString(64);

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-minio`,
      env: [
        `MINIO_ROOT_USER=${minioRootUser}`,
        `MINIO_ROOT_PASSWORD=${minioRootPassword}`,
        `MINIO_BROWSER=on`,
      ].join("\n"),
      source: {
        type: "image",
        image: "minio/minio:latest",
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

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-chrome`,
      env: [
        `TIMEOUT=10000`,
        `CONCURRENT=10`,
        `TOKEN=${chromeToken}`,
        `EXIT_ON_HEALTH_FAILURE=true`,
        `PRE_REQUEST_HEALTH_CHECK=true`,
      ].join("\n"),
      source: {
        type: "image",
        image: "ghcr.io/browserless/chromium:v2.18.0",
      },
    },
  });

  const appEnv = [
    `PORT=3000`,
    `NODE_ENV=production`,
    `PUBLIC_URL=https://$(EASYPANEL_DOMAIN)`,
    `STORAGE_URL=https://console-$(PROJECT_NAME)-${input.appServiceName}-minio.$(EASYPANEL_HOST)/default`,
    `DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
    `CHROME_TOKEN=${chromeToken}`,
    `CHROME_URL=ws://$(PROJECT_NAME)_${input.appServiceName}-chrome:3000`,
    `ACCESS_TOKEN_SECRET=${accessTokenSecret}`,
    `REFRESH_TOKEN_SECRET=${refreshTokenSecret}`,
    `MAIL_FROM=noreply@$(EASYPANEL_HOST)`,
    `STORAGE_ENDPOINT=$(PROJECT_NAME)-${input.appServiceName}-minio`,
    `STORAGE_PORT=9000`,
    `STORAGE_REGION=us-east-1`,
    `STORAGE_BUCKET=default`,
    `STORAGE_ACCESS_KEY=${minioRootUser}`,
    `STORAGE_SECRET_KEY=${minioRootPassword}`,
    `STORAGE_USE_SSL=false`,
    `STORAGE_SKIP_BUCKET_CHECK=false`,
    `DISABLE_SIGNUPS=${input.disableSignups ? "true" : "false"}`,
    `DISABLE_EMAIL_AUTH=${input.disableEmailAuth ? "true" : "false"}`,
    `OPENAI_API_KEY=`,
  ];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: appEnv.join("\n"),
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

  return { services };
}
