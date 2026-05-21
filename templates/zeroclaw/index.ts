import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `ZEROCLAW_gateway__allow_public_bind=true`,
        `ZEROCLAW_gateway__port=42617`,
        `ZEROCLAW_providers__models__openrouter__default__api_key=${input.apiKey}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: `$(EASYPANEL_DOMAIN)`,
          port: 42617,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/zeroclaw-data",
        },
      ],
    },
  });

  return { services };
}
