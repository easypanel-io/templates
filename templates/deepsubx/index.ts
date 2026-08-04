import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const appEnv = [`DEEPL_API_KEY=${input.deeplApiKey}`];

  if (input.plexHost) {
    appEnv.push(`PLEX_HOST=${input.plexHost}`);
  }
  if (input.plexPort) {
    appEnv.push(`PLEX_PORT=${input.plexPort}`);
  }
  if (input.plexToken) {
    appEnv.push(`PLEX_TOKEN=${input.plexToken}`);
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: appEnv.join("\n"),
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
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
        {
          type: "volume",
          name: "movies",
          mountPath: "/movies",
        },
      ],
    },
  });

  return { services };
}
