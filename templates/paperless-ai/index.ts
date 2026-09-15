import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const env = [
    "PAPERLESS_AI_INITIAL_SETUP=yes",
    `PAPERLESS_API_URL=${input.paperlessApiUrl}`,
    `PAPERLESS_API_TOKEN=${input.paperlessApiToken}`,
    input.paperlessUsername && `PAPERLESS_USERNAME=${input.paperlessUsername}`,
    `AI_PROVIDER=${input.aiProvider}`,
    `SCAN_INTERVAL=${input.scanInterval}`,
    input.openaiApiKey && `OPENAI_API_KEY=${input.openaiApiKey}`,
    input.ollamaApiUrl && `OLLAMA_API_URL=${input.ollamaApiUrl}`,
    input.ollamaModel && `OLLAMA_MODEL=${input.ollamaModel}`,
    input.customApiUrl && `CUSTOM_BASE_URL=${input.customApiUrl}`,
    input.customApiKey && `CUSTOM_API_KEY=${input.customApiKey}`,
    input.customModel && `CUSTOM_MODEL=${input.customModel}`,
    input.azureApiKey && `AZURE_API_KEY=${input.azureApiKey}`,
    input.azureEndpoint && `AZURE_ENDPOINT=${input.azureEndpoint}`,
    input.azureDeploymentName &&
      `AZURE_DEPLOYMENT_NAME=${input.azureDeploymentName}`,
    input.azureApiVersion && `AZURE_API_VERSION=${input.azureApiVersion}`,
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
          port: 3000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/app/data",
        },
      ],
    },
  });

  return { services };
}
