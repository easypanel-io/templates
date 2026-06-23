import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const adminPassword = randomPassword();
  const userPassword = randomPassword();
  const jwtSecret = randomPassword() + randomPassword() + randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
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
      env: [
        `ADMIN_EMAIL=${input.adminEmail}`,
        `ADMIN_PASSWORD=${adminPassword}`,
        `USER_EMAIL=${input.userEmail}`,
        `USER_PASSWORD=${userPassword}`,
        `JWT_SECRET=${jwtSecret}`,
        `STORAGE_PROVIDER=sqlite`,
        `STORAGE_SQLITE_PATH=/app/data/libredb-storage.db`,
      ].join("\n"),
    },
  });

  return { services };
}
