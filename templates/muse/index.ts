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
        `DATA_DIR=./data`,
        `DISCORD_TOKEN=${input.discordToken}`,
        `YOUTUBE_API_KEY=${input.youtubeApiKey}`,
        `SPOTIFY_CLIENT_ID=${input.spotifyClientId}`,
        `SPOTIFY_CLIENT_SECRET=${input.spotifyClientSecret}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage
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
