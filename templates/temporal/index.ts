import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  const development_sql = `limit.maxIDLength:
  - value: 255
    constraints: {}
system.forceSearchAttributesCacheRefreshOnRead:
  - value: true # Dev setup only. Please don't turn this on in production.
    constraints: {}`;

  const development_cass = `system.forceSearchAttributesCacheRefreshOnRead:
  - value: true # Dev setup only. Please don't turn this on in production.
    constraints: {}`;

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-web`,
      env: [
        `TEMPORAL_ADDRESS=$(PROJECT_NAME)_${input.appServiceName}-server:7233`,
        `TEMPORAL_CORS_ORIGINS=https://$(PRIMARY_DOMAIN)`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.temporalUiImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/",
          port: 8080,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-server`,
      env: [
        `DB=postgres12`,
        `DB_PORT=5432`,
        `POSTGRES_USER=postgres`,
        `POSTGRES_PWD=${databasePassword}`,
        `POSTGRES_SEEDS=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `DYNAMIC_CONFIG_FILE_PATH=config/dynamicconfig/development-sql.yaml`,
        `ENABLE_ES=true`,
        `ES_SEEDS=$(PROJECT_NAME)_${input.appServiceName}-elasticsearch`,
        `ES_VERSION=v7`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      mounts: [
        {
          type: "file",
          content: development_sql,
          mountPath: "/etc/temporal/config/dynamicconfig/development-sql.yaml",
        },
        {
          type: "file",
          content: development_cass,
          mountPath: "/etc/temporal/config/dynamicconfig/development-cass.yaml",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-admin-tools`,
      env: [
        `TEMPORAL_ADDRESS=$(PROJECT_NAME)_${input.appServiceName}-server:7233`,
        `TEMPORAL_CLI_ADDRESS=$(PROJECT_NAME)_${input.appServiceName}-server:7233`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.temporalAdminImage,
      },
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
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-elasticsearch`,
      env: [
        `cluster.routing.allocation.disk.threshold_enabled=true`,
        `cluster.routing.allocation.disk.watermark.low=512mb`,
        `cluster.routing.allocation.disk.watermark.high=256mb`,
        `cluster.routing.allocation.disk.watermark.flood_stage=128mb`,
        `discovery.type=single-node`,
        `ES_JAVA_OPTS=-Xms256m -Xmx256m`,
        `xpack.security.enabled=false`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.elasticsearchImage,
      },
      mounts: [
        {
          type: "volume",
          name: "elasticsearch-data",
          mountPath: "/var/lib/elasticsearch/data",
        },
      ],
    },
  });

  return { services };
}
