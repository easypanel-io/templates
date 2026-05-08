import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const envVars = [
    `QWE_LLM_URL=${input.llmUrl}`,
    `QWE_LLM_MODEL=${input.llmModel}`,
    `QWE_LLM_KEY=${input.llmKey}`,
  ];

  if (input.webPassword) {
    envVars.push(`QWE_PASSWORD=${input.webPassword}`);
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: envVars.join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 7860,
          // Allow up to 50MB uploads (knowledge base files, images, documents)
          // Default nginx client_max_body_size is 1MB which is too small
          middlewares: [
            {
              type: "buffering",
              options: {
                maxRequestBodyBytes: 52428800, // 50MB
              },
            },
          ],
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/root/.qwe-qwe",
        },
      ],
    },
  });

  return { services };
}
