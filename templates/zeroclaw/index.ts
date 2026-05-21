import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const providerEnvMap: Record<string, string> = {
    openrouter: "ZEROCLAW_providers__models__openrouter__default__api_key",
    openai: "ZEROCLAW_providers__models__openai__default__api_key",
    anthropic: "ZEROCLAW_providers__models__anthropic__default__api_key",
    ollama: "",
  };

  const envLines = [
    `ZEROCLAW_gateway__allow_public_bind=true`,
    `ZEROCLAW_gateway__port=42617`,
  ];

  if (input.provider !== "ollama" && input.apiKey) {
    const envKey = providerEnvMap[input.provider] || providerEnvMap.openrouter;
    envLines.push(`${envKey}=${input.apiKey}`);
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: envLines.join("\n"),
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
