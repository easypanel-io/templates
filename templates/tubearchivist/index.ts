import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const elasticsearchPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `ES_URL=http://$(PROJECT_NAME)_${input.appServiceName}-es:9200`,
        `REDIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
        `HOST_UID=1000`,
        `HOST_GID=1000`,
        `TA_HOST=https://$(PRIMARY_DOMAIN)`,
        `TA_USERNAME=${input.username}`,
        `TA_PASSWORD=${input.password}`,
        `ELASTIC_PASSWORD=${elasticsearchPassword}`,
        `TZ=America/New_York`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/youtube",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-es`,
      source: {
        type: "image",
        image: input.elasticsearchServiceImage,
      },
      env: [
        `ELASTIC_PASSWORD=${elasticsearchPassword}`,
        `ES_JAVA_OPTS=-Xms1g -Xmx1g`,
        `xpack.security.enabled=true`,
        `discovery.type=single-node`,
        `path.repo=/usr/share/elasticsearch/data/snapshot`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/usr/share/elasticsearch/data",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      source: {
        type: "image",
        image: input.redisServiceImage,
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
    },
  });

  return { services };
}
