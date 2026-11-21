import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [`ANTHROPIC_API_KEY=${input.anthropicApiKey ?? ""}`].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 7600,
        },
      ],
      ports: input.publishOtlpPort
        ? [
            {
              published: Number(input.otlpPort),
              target: 4317,
              protocol: "tcp",
            },
          ]
        : [],
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
