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
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      env: [
        `GHOST_HOST=0.0.0.0`,
        `GHOST_PORT=8080`,
        `GHOST_SIZE_LIMIT=10`,
        `GHOST_DB_PATH=/data/files.db`,
        `GHOST_FAKE_SSL=true`,
        `GHOST_INDEX_PATH=/data/index.html`,
        `GHOST_BLACKLIST_PATH=/data/blacklist.txt`,
      ].join("\n"),
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
