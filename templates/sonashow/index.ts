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
          port: 5000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/sonashow/config",
        },
      ],
      env: [
        `sonarr_address=${input.sonarrAddress}`,
        `sonarr_api_key=${input.sonarrApiKey}`,
        `tvdb_api_key=${input.tvdbApiKey}`,
        `tmdb_api_key=${input.tmdbApiKey}`,
        `root_folder_path=${input.rootFolderPath}`,
      ].join("\n"),
    },
  });

  return { services };
}
