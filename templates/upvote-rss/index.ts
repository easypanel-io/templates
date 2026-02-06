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
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      env: [
        `REDDIT_USER=${input.redditUser || ""}`,
        `REDDIT_CLIENT_ID=${input.redditClientId || ""}`,
        `REDDIT_CLIENT_SECRET=${input.redditClientSecret || ""}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "cache",
          mountPath: "/app/cache",
        },
      ],
    },
  });

  return { services };
}
