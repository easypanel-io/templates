import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const postgresPassword = randomPassword();
  const rabbitmqPassword = randomPassword();
  const redisPassword = randomPassword();

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-postgis`,
      image: "postgis/postgis:17-3.5-alpine",
      password: postgresPassword,
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
      serviceName: `${input.appServiceName}-rabbitmq`,
      source: {
        type: "image",
        image: "rabbitmq:3-management-alpine",
      },
      env: [
        `RABBITMQ_DEFAULT_USER=reitti`,
        `RABBITMQ_DEFAULT_PASS=${rabbitmqPassword}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/var/lib/rabbitmq",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-photon`,
      source: {
        type: "image",
        image: "rtuszik/photon-docker:1.2.1",
      },
      env: ["UPDATE_STRATEGY=PARALLEL", `REGION=${input.regionCode}`].join(
        "\n"
      ),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/photon/data",
        },
      ],
    },
  });

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
        `PHOTON_BASE_URL=http://$(PROJECT_NAME)_${input.appServiceName}-photon:2322`,
        `POSTGIS_USER=postgres`,
        `POSTGIS_PASSWORD=${postgresPassword}`,
        `POSTGIS_DB=$(PROJECT_NAME)`,
        `POSTGIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-postgis`,
        `RABBITMQ_HOST=$(PROJECT_NAME)_${input.appServiceName}-rabbitmq`,
        `RABBITMQ_PORT=5672`,
        `RABBITMQ_USER=reitti`,
        `RABBITMQ_PASSWORD=${rabbitmqPassword}`,
        `REDIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
        `REDIS_PORT=6379`,
        `REDIS_USERNAME=default`,
        `REDIS_PASSWORD=${redisPassword}`,
      ].join("\n"),
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
