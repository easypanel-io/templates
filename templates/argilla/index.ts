import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-web`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `ARGILLA_HOME_PATH=/var/lib/argilla`,
        `ARGILLA_ELASTICSEARCH=http://$(PROJECT_NAME)_${input.appServiceName}-elasticsearch:9200`,
        `ARGILLA_DATABASE_URL=postgresql+asyncpg://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
        `ARGILLA_REDIS_URL=redis://:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379/0`,
        `USERNAME=${input.loginUsername}`,
        `PASSWORD=${input.loginPassword}`,
        `API_KEY=argilla.apikey`,
        `WORKSPACE=default`,
        `# Optional settings (uncomment if needed)`,
        `#REINDEX_DATASETS=1`,
        `#HF_HUB_DISABLE_TELEMETRY=1`,
        `#HF_HUB_OFFLINE=1`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 6900,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "argilladata",
          mountPath: "/var/lib/argilla",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-worker`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `BACKGROUND_NUM_WORKERS=2`,
        `ARGILLA_HOME_PATH=/var/lib/argilla`,
        `ARGILLA_ELASTICSEARCH=http://$(PROJECT_NAME)_${input.appServiceName}-elasticsearch:9200`,
        `ARGILLA_DATABASE_URL=postgresql+asyncpg://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
        `ARGILLA_REDIS_URL=redis://:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379/0`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "argilladata",
          mountPath: "/var/lib/argilla",
        },
      ],
      deploy: {
        command:
          "python -m argilla_server worker --num-workers ${BACKGROUND_NUM_WORKERS}",
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-elasticsearch`,
      source: {
        type: "image",
        image: input.elasticsearchServiceImage,
      },
      env: [
        `node.name=elasticsearch`,
        `cluster.name=es-argilla-local`,
        `discovery.type=single-node`,
        `ES_JAVA_OPTS=-Xms512m -Xmx512m`,
        `cluster.routing.allocation.disk.threshold_enabled=false`,
        `xpack.security.enabled=false`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "elasticdata",
          mountPath: "/usr/share/elasticsearch/data/",
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

  return { services };
}
