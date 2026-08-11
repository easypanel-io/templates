import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const radarrSection =
    input.radarrUrl && input.radarrApiKey
      ? `
radarr:
  movies:
    base_url: ${input.radarrUrl}
    api_key: ${input.radarrApiKey}
    quality_definition:
      type: movie
    quality_profiles:
      - trash_id: ${
        input.radarrQualityProfileTrashId || "REPLACE_WITH_TRASH_ID"
      }
        reset_unmatched_scores:
          enabled: true`
      : "";

  const sonarrSection =
    input.sonarrUrl && input.sonarrApiKey
      ? `
sonarr:
  tv:
    base_url: ${input.sonarrUrl}
    api_key: ${input.sonarrApiKey}
    quality_definition:
      type: series
    quality_profiles:
      - trash_id: ${
        input.sonarrQualityProfileTrashId || "REPLACE_WITH_TRASH_ID"
      }
        reset_unmatched_scores:
          enabled: true`
      : "";

  const recyclarrConfig = `# yaml-language-server: $schema=https://schemas.recyclarr.dev/latest/config-schema.json
${radarrSection}
${sonarrSection}
`;

  const env = [
    `CRON_SCHEDULE=${input.cronSchedule}`,
    `TZ=${input.timezone || "UTC"}`,
  ].join("\n");

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env,
      mounts: [
        {
          type: "file",
          content: recyclarrConfig,
          mountPath: "/config/recyclarr.yml",
        },
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
        },
      ],
    },
  });

  return { services };
}
