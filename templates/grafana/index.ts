import {
  Output,
  Services
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `GF_CHECK_FOR_UPDATES=false`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 3000,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "storage",
          mountPath: "/var/lib/grafana",
        },
      ],
    },
  });

  return { services };
}
