import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const jwtAccessTokenSecret = randomString(64);
  const jwtRefreshTokenSecret = randomString(64);
  const redisPassword = randomPassword();
  const clickhousePassword = randomPassword();
  const apiKey = randomString(64);

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-frontend`,
      source: { type: "image", image: input.frontendImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 3000 }],
      env: [
        `API_URL=https://$(PROJECT_NAME)-${input.appServiceName}-api.$(EASYPANEL_HOST)`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-api`,
      source: { type: "image", image: input.apiImage },
      env: [
        `JWT_ACCESS_TOKEN_SECRET=${jwtAccessTokenSecret}`,
        `JWT_REFRESH_TOKEN_SECRET=${jwtRefreshTokenSecret}`,
        `API_KEY=${apiKey}`,
        `IP_GEOLOCATION_DB_PATH=`,
        `REDIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
        `REDIS_PASSWORD=${redisPassword}`,
        `CLICKHOUSE_HOST=http://$(PROJECT_NAME)-${input.appServiceName}-clickhouse`,
        `CLICKHOUSE_PORT=8123`,
        `CLICKHOUSE_USER=default`,
        `CLICKHOUSE_PASSWORD=${clickhousePassword}`,
        `CLICKHOUSE_DATABASE=analytics`,
      ].join("\n"),
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 5005 }],
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
      serviceName: `${input.appServiceName}-clickhouse`,
      source: { type: "image", image: input.clickhouseImage },
      env: [
        `CLICKHOUSE_DB=analytics`,
        `CLICKHOUSE_USER=default`,
        `CLICKHOUSE_PASSWORD=${clickhousePassword}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "clickhouse-data",
          mountPath: "/var/lib/clickhouse",
        },
        {
          type: "volume",
          name: "clickhouse-config",
          mountPath: "/etc/clickhouse-server/config.d",
        },
      ],
    },
  });

  return { services };
}
