import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `DATABASE_URL=jdbc:postgresql://$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
        `DATABASE_ROOT_USERNAME=postgres`,
        `DATABASE_ROOT_PASSWORD=${databasePassword}`,
        `DATABASE_USERNAME=postgres`,
        `DATABASE_PASSWORD=${databasePassword}`,
        `FUSIONAUTH_APP_MEMORY=512M`,
        `FUSIONAUTH_APP_RUNTIME_MODE=production`,
        `FUSIONAUTH_APP_URL=https://$(PRIMARY_DOMAIN)`,
        `SEARCH_SERVERS=http://$(PROJECT_NAME)-${input.appServiceName}-search:9200`,
        `SEARCH_TYPE=elasticsearch`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 9011,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/usr/local/fusionauth/config",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-search`,
      env: [
        `cluster.name=fusionauth`,
        `discovery.type=single-node`,
        `node.name=opensearch`,
        `plugins.security.disabled=true`,
        `bootstrap.memory_lock=true`,
        `opensearch_java_opts=-Xms512m -Xmx512m`,
        `OPENSEARCH_INITIAL_ADMIN_PASSWORD=${input.searchPassword}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.opensearchServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 9200,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/usr/share/opensearch/data",
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
