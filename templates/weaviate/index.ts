import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `QUERY_DEFAULTS_LIMIT=25`,
        `AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED='true'`,
        `PERSISTENCE_DATA_PATH='/var/lib/weaviate'`,
        `DEFAULT_VECTORIZER_MODULE='none'`,
        `ENABLE_MODULES=''`,
        `CLUSTER_HOSTNAME='node1'`,
      ].join("\n"),
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
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/var/lib/weaviate",
        },
      ],
    },
  });

  return { services };
}
