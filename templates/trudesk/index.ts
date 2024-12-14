import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mongoPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `NODE_ENV=production`,
        `TRUDESK_DOCKER=true `,
        `TD_MONGODB_SERVER=mongodb://mongo:${mongoPassword}@$(PROJECT_NAME)_${input.databaseServiceName}:27017`,
        `ELATICSEARCH_URI=http://$(PROJECT_NAME)_${input.searchServiceName}:9200`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8118,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "uploads",
          mountPath: "/data/storage",
        },
        {
          type: "volume",
          name: "plugins",
          mountPath: "/data/storage",
        },
        {
          type: "volume",
          name: "backups",
          mountPath: "/app/storage",
        },
      ],
    },
  });

  services.push({
    type: "mongo",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: mongoPassword,
    },
  });

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.searchServiceName,
      source: {
        type: "image",
        image: "elasticsearch:8.0.0",
      },
      env: [
        `xpack.security.enabled=false`,
        `xpack.security.http.ssl.enabled=false`,
        `node.name=${input.searchServiceName}`,
        `cluster.initial_master_nodes==${input.searchServiceName}`,
        `discovery.seed_hosts=${input.searchServiceName}`,
        `bootstrap.memory_lock=true`,
      ].join("\n"),
    },
  });

  return { services };
}
