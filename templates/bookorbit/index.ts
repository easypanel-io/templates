import { Output, randomPassword, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const dbPassword = randomPassword();
  const jwtSecret = randomString(32);
  const bootstrapToken = randomString(32);

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      image: "pgvector/pgvector:pg16",
      password: dbPassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      env: [
        `NODE_ENV=production`,
        `PORT=3000`,
        `APP_URL=https://$(EASYPANEL_DOMAIN)`,
        `CLIENT_URL=https://$(EASYPANEL_DOMAIN)`,
        `POSTGRES_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `POSTGRES_PORT=5432`,
        `POSTGRES_USER=postgres`,
        `POSTGRES_PASSWORD=${dbPassword}`,
        `POSTGRES_DB=$(PROJECT_NAME)`,
        `JWT_SECRET=${jwtSecret}`,
        `SETUP_BOOTSTRAP_TOKEN=${bootstrapToken}`,
        `LOG_LEVEL=info`,
      ].join("\n"),
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 3000 }],
      mounts: [
        { type: "volume", name: "books", mountPath: "/books" },
        { type: "volume", name: "data", mountPath: "/data" },
      ],
    },
  });

  return { services };
}
