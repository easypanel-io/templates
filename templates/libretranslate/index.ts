import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        "LT_HOST=0.0.0.0",
        `LT_SUGGESTIONS=${input.suggestions}`,
        `LT_CHAR_LIMIT=${input.chartLimit}`,
        `LT_REQ_LIMIT=${input.reqLimit}`,
        `LT_BATCH_LIMIT=${input.bachLimit}`,
        `LT_GA_ID=${input.googleAnalytics}`,
        `LT_DISABLE_WEB_UI=${input.disableWebUI}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5000,
        },
      ],
    },
  });

  return { services };
}
