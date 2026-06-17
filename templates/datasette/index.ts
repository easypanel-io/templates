import { Output, randomString, Services } from "~templates-utils";
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
          port: 8001,
        },
      ],
      env: [`DATASETTE_SECRET=${randomString(32)}`].join("\n"),
      deploy: {
        command:
          "datasette -p 8001 -h 0.0.0.0 /data --setting sql_time_limit_ms 5000",
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
    },
  });

  return { services };
}
