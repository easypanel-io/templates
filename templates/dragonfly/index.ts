import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const envVars = [
    `DFLY_requirepass=${input.password}`,
    `DFLY_dir=/data`,
    `DFLY_dbfilename=dump-{timestamp}`,
    `DFLY_snapshot_cron=${input.snapshotCron || "*/5 * * * *"}`,
    `HEALTHCHECK_PORT=6379`,
  ];

  if (input.maxMemory) {
    envVars.push(`DFLY_maxmemory=${input.maxMemory}`);
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: envVars.join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      ports: [
        {
          published: 6379,
          target: 6379,
          protocol: "tcp",
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "dragonfly-data",
          mountPath: "/data",
        },
      ],
    },
  });

  return { services };
}
