import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `lidarr_address=${input.lidarrAddress}`,
        `lidarr_api_key=${input.lidarrApiKey}`,
        `root_folder_path=${input.rootFolderPath}`,
        `last_fm_api_key=${input.lastFmApiKey}`,
        `last_fm_api_secret=${input.lastFmApiSecret}`,
        `mode=LastFM`,
        `fallback_to_top_result=${input.fallbackToTopResult}`,
        `auto_start=${input.autoStart}`,
      ].join("\n"),
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
          mountPath: "/lidify/config",
        },
      ],
    },
  });

  return { services };
}
