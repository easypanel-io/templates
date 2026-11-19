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
  const appSecret = randomString(32);
  const nextauthSecret = randomString(32);

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
      env: [
        `APP_SECRET=${appSecret}`,
        `NEXTAUTH_SECRET=${nextauthSecret}`,
        `NEXTAUTH_URL=https://$(PRIMARY_DOMAIN)`,
        `APP_URL=https://$(PRIMARY_DOMAIN)`,
        `DATABASE_URL=postgresql://postgres:${postgresPassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
        `POSTGRES_USER=postgres`,
        `POSTGRES_PASSWORD=${postgresPassword}`,
        `POSTGRES_DB=$(PROJECT_NAME)`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/app/data",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: postgresPassword,
    },
  });

  return { services };
}
