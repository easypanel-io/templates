import { randomBytes } from "crypto";
import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const appKey = `base64:${randomBytes(32).toString("base64")}`;
  const appEnv = [
    `APP_KEY=${appKey}`,
    `APP_ENV=production`,
    `APP_URL=https://$(PRIMARY_DOMAIN)`,
    `APP_FORCE_HTTPS=true`,
    `TRUSTED_PROXIES=*`,
  ];

  if (input.databaseType === "sqlite") {
    appEnv.push(`DB_CONNECTION=sqlite`);
    appEnv.push(`DB_DATABASE=/data/database.sqlite`);
  }

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
          port: 8000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
        {
          type: "volume",
          name: "uploads",
          mountPath: "/app/public/uploads",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/app/storage/logs",
        },
      ],
    },
  });

  return { services };
}
