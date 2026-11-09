import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const redisPassword = randomPassword();
  const databasePassword = randomPassword();
  const temporalDatabasePassword = randomPassword();
  const jwtSecret = randomString(32);

  const temporalServiceName = `${input.appServiceName}-temporal`;
  const temporalDatabaseServiceName = `${input.appServiceName}-temporal-db`;
  const temporalElasticsearchServiceName = `${input.appServiceName}-temporal-es`;
  const uploadDirectory = "/uploads";

  const temporalDynamicConfig = `limit.maxIDLength:
  - value: 255
    constraints: {}
system.forceSearchAttributesCacheRefreshOnRead:
  - value: true # Dev setup only. Please don't turn this on in production.
    constraints: {}`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `MAIN_URL=https://$(PRIMARY_DOMAIN)`,
        `FRONTEND_URL=https://$(PRIMARY_DOMAIN)`,
        `NEXT_PUBLIC_BACKEND_URL=https://$(PRIMARY_DOMAIN)/api`,
        `JWT_SECRET=${jwtSecret}`,
        `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
        `REDIS_URL=redis://:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379`,
        `BACKEND_INTERNAL_URL=http://localhost:3000`,
        `TEMPORAL_ADDRESS=$(PROJECT_NAME)_${temporalServiceName}:7233`,
        `IS_GENERAL=true`,
        `DISABLE_REGISTRATION=false`,
        `RUN_CRON=true`,
        `STORAGE_PROVIDER=local`,
        `UPLOAD_DIRECTORY=${uploadDirectory}`,
        `NEXT_PUBLIC_UPLOAD_DIRECTORY=${uploadDirectory}`,
        `TZ=UTC`,
        // The backend listens on PORT (default 3000) behind the internal nginx
        // on 5000; set it explicitly so it doesn't take the service port.
        `PORT=3000`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "uploads",
          mountPath: uploadDirectory,
        },
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5000,
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

  services.push({
    type: "redis",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      password: redisPassword,
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: temporalDatabaseServiceName,
      image: "postgres:16",
      password: temporalDatabasePassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: temporalElasticsearchServiceName,
      source: {
        type: "image",
        image: input.temporalElasticsearchServiceImage,
      },
      env: [
        `cluster.routing.allocation.disk.threshold_enabled=true`,
        `cluster.routing.allocation.disk.watermark.low=512mb`,
        `cluster.routing.allocation.disk.watermark.high=256mb`,
        `cluster.routing.allocation.disk.watermark.flood_stage=128mb`,
        `discovery.type=single-node`,
        `ES_JAVA_OPTS=-Xms256m -Xmx256m`,
        `xpack.security.enabled=false`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "elasticsearch-data",
          mountPath: "/usr/share/elasticsearch/data",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: temporalServiceName,
      source: {
        type: "image",
        image: input.temporalServiceImage,
      },
      env: [
        `DB=postgres12`,
        `DB_PORT=5432`,
        `POSTGRES_USER=postgres`,
        `POSTGRES_PWD=${temporalDatabasePassword}`,
        `POSTGRES_SEEDS=$(PROJECT_NAME)_${temporalDatabaseServiceName}`,
        `DYNAMIC_CONFIG_FILE_PATH=config/dynamicconfig/development-sql.yaml`,
        `ENABLE_ES=true`,
        `ES_SEEDS=$(PROJECT_NAME)_${temporalElasticsearchServiceName}`,
        `ES_VERSION=v7`,
        `TEMPORAL_NAMESPACE=default`,
        `BIND_ON_IP=0.0.0.0`,
        `TEMPORAL_BROADCAST_ADDRESS=127.0.0.1`,
        `TEMPORAL_ADDRESS=127.0.0.1:7233`,
      ].join("\n"),
      mounts: [
        {
          type: "file",
          content: temporalDynamicConfig,
          mountPath: "/etc/temporal/config/dynamicconfig/development-sql.yaml",
        },
      ],
    },
  });

  return { services };
}
