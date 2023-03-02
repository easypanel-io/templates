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
        `APP_URL=https://${input.domain}`,
        `TZ=utc`,
        `DISABLE_BUILTIN_AUTH=false`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 5690,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data/database",
        },
      ],
      domains: [
        {
          name: input.domain,
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
