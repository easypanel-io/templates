import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const accessCode = input.accessCode || randomString(12);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `OPENAI_API_KEY=${input.openAiKey}`,
        `OPENAI_PROXY_URL=${input.openAiProxy}`,
        `ACCESS_CODE=${accessCode}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: `$(EASYPANEL_DOMAIN)`,
          port: 3210,
        },
      ],
    },
  });

  return { services };
}
