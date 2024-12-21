import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databaseRootPassword = randomPassword();
  const redisPassword = randomPassword();

  const demoValue: string = input.enableDemoData ? "yes" : "no";
  const prodValue: string = input.enableProductionSetup ? "yes" : "no";

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-gui`,
      source: {
        type: "image",
        image: input.guiServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/",
          port: 80,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-api`,
      env: [
        `ELASTIC_HOST=http://$(PROJECT_NAME)_${input.appServiceName}-elasticsearch:9200`,
        `REDIS_HOST=redis://$(PROJECT_NAME)_${input.appServiceName}-redis:6379`,
        `REDIS_PASSWORD=${redisPassword}`,
        `MYSQL_HOST=$(PROJECT_NAME)_${input.appServiceName}-mysql`,
        `MYSQL_USERNAME=root`,
        `MYSQL_PASSWORD=${databaseRootPassword}`,
        `MYSQL_DATABASE=$(PROJECT_NAME)`,
        `LOGGING_LEVEL=info`,
        `DEMO=${demoValue}`,
        `PRODUCTION=${prodValue}`,
        `SAVE_LOGS=yes`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.apiServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/",
          port: 80,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-apm`,
      env: [
        `ELASTIC_HOST=http://$(PROJECT_NAME)_${input.appServiceName}-elasticsearch:9200`,
        `REDIS_HOST=redis://$(PROJECT_NAME)_${input.appServiceName}-redis:6379`,
        `REDIS_PASSWORD=${redisPassword}`,
        `MYSQL_HOST=$(PROJECT_NAME)_${input.appServiceName}-mysql`,
        `MYSQL_USERNAME=root`,
        `MYSQL_PASSWORD=${databaseRootPassword}`,
        `MYSQL_DATABASE=$(PROJECT_NAME)`,
        `MODE=worker`,
        `PAUSE=15`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.apmServiceImage,
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-worker`,
      env: [
        `ELASTIC_HOST=http://$(PROJECT_NAME)_${input.appServiceName}-elasticsearch:9200`,
        `REDIS_HOST=redis://$(PROJECT_NAME)_${input.appServiceName}-redis:6379`,
        `REDIS_PASSWORD=${redisPassword}`,
        `MYSQL_HOST=$(PROJECT_NAME)_${input.appServiceName}-mysql`,
        `MYSQL_USERNAME=root`,
        `MYSQL_PASSWORD=${databaseRootPassword}`,
        `MYSQL_DATABASE=$(PROJECT_NAME)`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.workerServiceImage,
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-elasticsearch`,
      env: [
        `bootstrap.memory_lock=true`,
        `ES_JAVA_OPTS=-Xms512m -Xmx512m`,
        `discovery.type=single-node`,
        `xpack.security.enabled=false`,
        `cluster.name=ElasticSearchCluster`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.elasticsearchServiceImage,
      },
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
    type: "mysql",
    data: {
      serviceName: `${input.appServiceName}-mysql`,
      rootPassword: databaseRootPassword,
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
