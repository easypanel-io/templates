import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `ELASTIC_PASSWORD=${input.password}`,
        `discovery.type=single-node`,
        `xpack.security.enabled=true`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          https: true,
          port: 9200,
          path: "/",
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/usr/share/elasticsearch/data",
        },
      ],
      resources: {
        memoryReservation: 0,
        memoryLimit: 512,
        cpuReservation: 0,
        cpuLimit: 0,
      },
    },
  });

  return { services };
}
