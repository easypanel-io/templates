import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.databaseServiceName,
      source: {
        type: "image",
        image: "docker.io/bitnami/mongodb:4.4",
      },
      mounts: [
        {
          type: "volume",
          name: "mongodb_data",
          mountPath: "/bitnami/mongodb",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      deploy: { replicas: 1, command: null, zeroDowntime: true },
      env: [
        `MONGODB_REPLICA_SET_MODE=primary`,
        `MONGODB_REPLICA_SET_NAME=rs0`,
        `MONGODB_PORT_NUMBER=27017`,
        `MONGODB_INITIAL_PRIMARY_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `MONGODB_INITIAL_PRIMARY_PORT_NUMBER=27017`,
        `MONGODB_ADVERTISED_HOSTNAME=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `MONGODB_ENABLE_JOURNAL=true`,
        `ALLOW_EMPTY_PASSWORD=true`,
      ].join("\n"),
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
          port: 80,
        },
      ],
      deploy: { replicas: 1, command: null, zeroDowntime: true },
      env: [
        `MONGO_URL=mongodb://$(PROJECT_NAME)_${input.databaseServiceName}:27017/rocketchat?replicaSet=rs0`,
        `MONGO_OPLOG_URL=mongodb://$(PROJECT_NAME)_${input.databaseServiceName}:27017/local?replicaSet=rs0`,
      ].join("\n"),
    },
  });

  return { services };
}
