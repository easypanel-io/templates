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
          port: 80,
        },
      ],
      env: [
        `NODE_ENV=production`,
        `ENABLE_SERVER_STORAGE=${input.enableServerStorage}`,
        `STORAGE_PATH=/data/diagrams`,
        `ENABLE_GIT_BACKUP=${input.enableGitBackup}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "diagrams",
          mountPath: "/data/diagrams",
        },
      ],
    },
  });

  return { services };
}
