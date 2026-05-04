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
      env: ["LOG_LEVEL=info"].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "open-meteo-data",
          mountPath: "/app/data",
        },
      ],
      deploy: {
        command:
          "./openmeteo-api serve --env production --hostname 0.0.0.0 --port 8080",
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.syncServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: ["LOG_LEVEL=info"].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "open-meteo-data",
          mountPath: "/app/data",
        },
      ],
      deploy: {
        command: input.syncCommand,
      },
    },
  });

  return { services };
}
