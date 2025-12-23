import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const dbPassword = randomPassword();
  const secretKey = randomString(64);
  const machineSignature = randomString(32);

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: dbPassword,
      image: "postgres:12",
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-cache`,
      source: {
        type: "image",
        image: "valkey/valkey:8",
      },
      deploy: {
        command: "valkey-server --save 60 1 --loglevel warning --dir /data",
      },
      mounts: [
        {
          type: "volume",
          name: "cache",
          mountPath: "/data",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-api`,
      source: {
        type: "image",
        image: input.apiImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      env: [
        `NODE_ENV=production`,
        `PORT=8000`,
        `LOGCHIMP_API_HOST=$(PRIMARY_DOMAIN)`,
        `LOGCHIMP_IS_SELF_HOSTED=true`,
        `LOGCHIMP_SECRET_KEY=${secretKey}`,
        `LOGCHIMP_MACHINE_SIGNATURE=${machineSignature}`,
        `LOGCHIMP_WEB_URL=https://$(PROJECT_NAME)-${input.appServiceName}-theme.$(EASYPANEL_HOST)`,
        `LOGCHIMP_DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `LOGCHIMP_DB_DATABASE=$(PROJECT_NAME)`,
        `LOGCHIMP_DB_PORT=5432`,
        `LOGCHIMP_DB_USER=postgres`,
        `LOGCHIMP_DB_PASSWORD=${dbPassword}`,
        `LOGCHIMP_DB_SSL=false`,
        `LOGCHIMP_VALKEY_URL=$(PROJECT_NAME)_${input.appServiceName}-cache:6379`,
        `LOGCHIMP_MAIL_HOST=`,
        `LOGCHIMP_MAIL_USER=`,
        `LOGCHIMP_MAIL_PASSWORD=`,
        `LOGCHIMP_MAIL_PORT=`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-theme`,
      source: {
        type: "image",
        image: input.themeImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      env: [
        `NODE_ENV=production`,
        `PORT=3000`,
        `VITE_API_URL=https://$(PROJECT_NAME)-${input.appServiceName}-api.$(EASYPANEL_HOST)`,
        `VITE_IS_SELF_HOSTED=true`,
      ].join("\n"),
    },
  });

  return { services };
}
