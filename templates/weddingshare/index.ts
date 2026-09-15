import {
  Output,
  Services,
  randomPassword,
  randomString,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const adminPassword = input.adminPassword || randomPassword();

  const env = [
    `TITLE=${input.title}`,
    "DATABASE_TYPE=sqlite",
    "DATABASE_CONNECTION_STRING=Data Source=./config/weddingshare.db",
    `ACCOUNT_ADMIN_PASSWORD=${adminPassword}`,
    `SECURITY_ENCRYPTION_KEY=${randomString(32)}`,
    `SECURITY_ENCRYPTION_SALT=${randomString(16)}`,
  ].join("\n");

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env,
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/app/config",
        },
        {
          type: "volume",
          name: "uploads",
          mountPath: "/app/uploads",
        },
        {
          type: "volume",
          name: "thumbnails",
          mountPath: "/app/thumbnails",
        },
        {
          type: "volume",
          name: "custom-resources",
          mountPath: "/app/custom_resources",
        },
      ],
    },
  });

  return { services };
}
