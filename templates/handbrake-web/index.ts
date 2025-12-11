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
          port: 9999,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
        {
          type: "volume",
          name: "video",
          mountPath: "/video",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-worker`,
      source: {
        type: "image",
        image:
          input.workerImage ||
          "ghcr.io/thenickoftime/handbrake-web-worker:latest",
      },
      env: [
        `WORKER_ID=${input.workerId || "worker-1"}`,
        `SERVER_URL=$(PROJECT_NAME)_${input.appServiceName}`,
        `SERVER_PORT=9999`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "video",
          mountPath: "/video",
        },
      ],
    },
  });

  return { services };
}
