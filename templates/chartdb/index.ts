import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const env = [];
  if (input.openaiApiKey) {
    env.push(`OPENAI_API_KEY=${input.openaiApiKey}`);
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: env.join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
    },
  });

  return { services };
}
