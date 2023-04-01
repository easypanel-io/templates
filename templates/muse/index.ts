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
        `DISCORD_TOKEN=${input.discordToken}`,
        `YOUTUBE_API_KEY=${input.youtubeApiKey}`,
        `SPOTIFY_CLIENT_ID=${input.spotifyClientId}`,
        `SPOTIFY_CLIENT_SECRET=${input.spotifyClientSecret}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage
      },
    },
  });

  return { services };
}
