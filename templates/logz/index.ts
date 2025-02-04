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
      env: [
        `HEADERS=user-agent:logzio-docker-logs`,
        `LOGZIO_LOGS_TOKEN=${input.logzShippingToken}`,
      ].join("\n"),
      mounts: [
        {
          type: "bind",
          hostPath: "/var/run/docker.sock",
          mountPath: "/var/run/docker.sock",
        },
        {
          type: "bind",
          hostPath: "/var/lib/docker/containers",
          mountPath: "/var/lib/docker/containers",
        },
      ],
    },
  });

  return { services };
}
