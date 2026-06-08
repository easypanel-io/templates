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
  const redisPassword = randomPassword();
  const jwtSecret = randomString(32);
  const adminSecret = randomString(32);
  const clientId = randomString(16);
  const clientSecret = randomString(32);

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
          port: 8080,
        },
      ],
      env: [
        `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)?sslmode=disable`,
        `REDIS_URL=redis://default:${redisPassword}@$(PROJECT_NAME)_${input.redisServiceName}:6379`,
        `DOMAIN=https://$(EASYPANEL_DOMAIN)`,
      ].join("\n"),
      deploy: {
        command: `./authorizer --database-type=postgres --database-url="$DATABASE_URL" --redis-url="$REDIS_URL" --jwt-type=HS256 --jwt-secret="${jwtSecret}" --admin-secret="${adminSecret}" --client-id="${clientId}" --client-secret="${clientSecret}" --allowed-origins="$DOMAIN" --env=production`,
      },
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  services.push({
    type: "redis",
    data: { serviceName: input.redisServiceName, password: redisPassword },
  });

  return { services };
}
