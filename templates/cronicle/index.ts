import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: "TZ=Europe/Copenhagen",
      deploy: {
        replicas: 1,
        command: null,
        zeroDowntime: true,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3012,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/opt/cronicle/data",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/opt/cronicle/logs",
        },
        {
          type: "volume",
          name: "plugins",
          mountPath: "/opt/cronicle/plugins",
        },
      ],
    },
  });

  return { services };
}
