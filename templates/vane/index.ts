import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const env: string[] = [];

  if (input.searxngApiUrl) {
    env.push(`SEARXNG_API_URL=${input.searxngApiUrl}`);
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: env.join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/home/vane/data",
        },
      ],
    },
  });

  return { services };
}
