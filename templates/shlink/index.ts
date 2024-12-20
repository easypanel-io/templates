import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const apiKey = Buffer.from(randomString(32)).toString("base64");

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `DEFAULT_DOMAIN=${input.serverUrl}`,
        `IS_HTTPS_ENABLED=true`,
        `INITIAL_API_KEY=${apiKey}`,
      ].join("\n"),
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

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `SHLINK_SERVER_API_KEY=${apiKey}`,
        `SHLINK_SERVER_URL=${input.serverUrl}`,
      ].join("\n"),
      source: {
        type: "image",
        image: `${input.appServiceImage}-web`,
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
