import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const envVars = [
    `CASTOR_LLM_URL=${input.llmUrl}`,
    `CASTOR_LLM_MODEL=${input.llmModel}`,
    `CASTOR_LLM_KEY=${input.llmKey}`,
  ];

  if (input.webPassword) {
    envVars.push(`CASTOR_PASSWORD=${input.webPassword}`);
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
        },
      ],
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
