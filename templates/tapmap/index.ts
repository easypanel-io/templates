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
        `TAPMAP_PORT=8050`,
        `TAPMAP_HOST=0.0.0.0`,
        `TAPMAP_DATA_DIR=/data`,
        `TAPMAP_IN_DOCKER=1`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8050,
        },
      ],
      mounts: [
        {
          type: "bind",
          hostPath: input.dataDir,
          mountPath: "/data",
        },
      ],
    },
  });

  return { services };
}
