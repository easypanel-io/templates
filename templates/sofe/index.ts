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
      env: [
        `SONARR_URL=${input.sonarrUrl}`,
        `SONARR_API_KEY=${input.sonarrApiKey}`,
        `SONARR_SERIES_ID=${input.sonarrSeriesId}`,
        `AFL_ANIME_NAME=${input.aflAnimeName}`,
        `PLEX_URL=${input.plexUrl}`,
        `PLEX_TOKEN=${input.plexToken}`,
        `CREATE_PLEX_COLLECTION=${
          input.createPlexCollection ? "True" : "False"
        }`,
        `MONITOR_NON_FILLER_SONARR_EPISODES=${
          input.monitorNonFillerEpisodes ? "True" : "False"
        }`,
        `PLEX_ANIME_LIBRARY=${input.plexAnimeLibrary}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 7979,
        },
      ],
    },
  });

  return { services };
}
