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
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      env: [
        "CUPDATE_DOCKER_HOST=unix:///var/run/docker.sock",
        "CUPDATE_CACHE_PATH=/var/run/data/cachev1.boltdb",
        "CUPDATE_DB_PATH=/var/run/data/dbv1.sqlite",
        "CUPDATE_LOGOS_PATH=/var/run/data/logos",
      ].join("\n"),
      mounts: [
        {
          type: "bind",
          hostPath: "/var/run/docker.sock",
          mountPath: "/var/run/docker.sock",
          readOnly: true,
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/var/run/data",
        },
      ],
    },
  });

  return { services };
}
