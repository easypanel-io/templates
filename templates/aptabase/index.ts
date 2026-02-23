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
  const clickhousePassword = randomPassword();
  const authSecret = randomString(64);

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
        `BASE_URL=https://$(PRIMARY_DOMAIN)`,
        `AUTH_SECRET=${authSecret}`,
        `DATABASE_URL=Server=${input.appServiceName}-db;Port=5432;User Id=postgres;Password=${databasePassword};Database=$(PROJECT_NAME)`,
        `CLICKHOUSE_URL=Host=${input.appServiceName}-clickhouse;Port=8123;Username=aptabase;Password=${clickhousePassword}`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-clickhouse`,
      source: {
        type: "image",
        image: input.clickhouseServiceImage,
      },
      env: [
        `CLICKHOUSE_USER=aptabase`,
        `CLICKHOUSE_PASSWORD=${clickhousePassword}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "events-db-data",
          mountPath: "/var/lib/clickhouse",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  return { services };
}
