import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `TOKEN="${input.discordToken}"`,
        `MAX_PLAYLIST_SIZE=${input.maxPlaylistSize}`,
        `PRUNING=true`,
        `LOCALE=${input.locale}`,
        `DEFAULT_VOLUME=${input.defaultVolume}`,
        `STAY_TIME=30`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
    },
  });

  return { services };
}
