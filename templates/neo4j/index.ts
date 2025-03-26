import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [`NEO4J_AUTH=${input.neo4jUser}/${input.neo4jPassword}`].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "neo4j_logs",
          mountPath: "/logs",
        },
        {
          type: "volume",
          name: "neo4j_config",
          mountPath: "/config",
        },
        {
          type: "volume",
          name: "neo4j_data",
          mountPath: "/data",
        },
        {
          type: "volume",
          name: "neo4j_plugins",
          mountPath: "/plugins",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 7474,
        },
      ],
    },
  });

  return { services };
}
