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
        `MINIO_BROWSER=off`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.minioServiceImage,
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
      deploy: {
        command: `minio server /data`,
      },
      domains: [
        {
          host: `$(EASYPANEL_DOMAIN)`,
          port: 9000,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-printer`,
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
    `APP_URL=https://$(EASYPANEL_DOMAIN)`,
    `PUBLIC_URL=https://$(EASYPANEL_DOMAIN)`,
    `STORAGE_URL=https://storage-$(EASYPANEL_DOMAIN)/default`,
    `DATABASE_URL=postgresql://postgres:${databasePassword}@${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
    `PRINTER_ENDPOINT=ws://${input.appServiceName}-printer:3000?token=${chromeToken}`,
    `CHROME_TOKEN=${chromeToken}`,
    `CHROME_URL=ws://${input.appServiceName}-printer:3000`,
    `AUTH_SECRET=${accessTokenSecret}`,
    `ACCESS_TOKEN_SECRET=${accessTokenSecret}`,
    `REFRESH_TOKEN_SECRET=${refreshTokenSecret}`,
    `MAIL_FROM=noreply@$(EASYPANEL_HOST)`,
    `STORAGE_ENDPOINT=${input.appServiceName}-minio`,
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
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/app/data",
        },
      ],
    },
  });

  return { services };
}
