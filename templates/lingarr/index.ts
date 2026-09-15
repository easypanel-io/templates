import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const env = [
    "ASPNETCORE_URLS=http://+:9876",
    "DB_CONNECTION=sqlite",
    `MAX_CONCURRENT_JOBS=${input.maxConcurrentJobs}`,
    `SERVICE_TYPE=${JSON.stringify([input.serviceType])}`,
    `SOURCE_LANGUAGES=${input.sourceLanguages}`,
    `TARGET_LANGUAGES=${input.targetLanguages}`,
    input.libreTranslateUrl && `LIBRE_TRANSLATE_URL=${input.libreTranslateUrl}`,
    input.libreTranslateApiKey &&
      `LIBRE_TRANSLATE_API_KEY=${input.libreTranslateApiKey}`,
    input.deeplApiKey && `DEEPL_API_KEY=${input.deeplApiKey}`,
    input.openaiApiKey && `OPENAI_API_KEY=${input.openaiApiKey}`,
    input.openaiModel && `OPENAI_MODEL=${input.openaiModel}`,
    input.anthropicApiKey && `ANTHROPIC_API_KEY=${input.anthropicApiKey}`,
    input.anthropicModel && `ANTHROPIC_MODEL=${input.anthropicModel}`,
    input.geminiApiKey && `GEMINI_API_KEY=${input.geminiApiKey}`,
    input.geminiModel && `GEMINI_MODEL=${input.geminiModel}`,
    input.deepseekApiKey && `DEEPSEEK_API_KEY=${input.deepseekApiKey}`,
    input.deepseekModel && `DEEPSEEK_MODEL=${input.deepseekModel}`,
    input.localAiEndpoint && `LOCAL_AI_ENDPOINT=${input.localAiEndpoint}`,
    input.localAiApiKey && `LOCAL_AI_API_KEY=${input.localAiApiKey}`,
    input.localAiModel && `LOCAL_AI_MODEL=${input.localAiModel}`,
    input.aiPrompt && `AI_PROMPT=${input.aiPrompt}`,
    input.radarrUrl && `RADARR_URL=${input.radarrUrl}`,
    input.radarrApiKey && `RADARR_API_KEY=${input.radarrApiKey}`,
    input.sonarrUrl && `SONARR_URL=${input.sonarrUrl}`,
    input.sonarrApiKey && `SONARR_API_KEY=${input.sonarrApiKey}`,
  ]
    .filter(Boolean)
    .join("\n");

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env,
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 9876,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/app/config",
        },
        {
          type: "volume",
          name: "movies",
          mountPath: "/movies",
        },
        {
          type: "volume",
          name: "tv",
          mountPath: "/tv",
        },
      ],
    },
  });

  return { services };
}
