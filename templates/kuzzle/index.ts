import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const redisPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 7512,
        },
      ],
      env: [
        `kuzzle_services__storageEngine__client__node=http://$(PROJECT_NAME)_${input.appServiceName}-elasticsearch:9200`,
        `kuzzle_services__internalCache__node__host=$(PROJECT_NAME)_${input.appServiceName}-redis`,
        `kuzzle_services__internalCache__node__password=${redisPassword}`,
        `kuzzle_services__memoryStorage__node__host=$(PROJECT_NAME)_${input.appServiceName}-redis`,
        `kuzzle_services__memoryStorage__node__password=${redisPassword}`,
        `kuzzle_server__protocols__mqtt__enabled=true`,
        `NODE_ENV=production`,
      ].join("\n"),
      ports: [
        {
          published: 1883,
          target: 1883,
          protocol: "tcp",
        },
      ],
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
      serviceName: `${input.appServiceName}-elasticsearch`,
      source: { type: "image", image: input.elasticServiceImage },
      mounts: [
        {
          type: "volume",
          name: "elasticsearch",
          mountPath: "/usr/share/elasticsearch",
        },
      ],
    },
  });

  return { services };
}
