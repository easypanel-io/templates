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
      env: ["MEMCACHED_CACHE_SIZE=64", "MEMCACHED_THREADS=4"].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "memcached-data",
          mountPath: "/data",
        },
      ],
    },
  });

  return { services };
}
