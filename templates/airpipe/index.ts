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
      env: [
        `PORT=8080`,
        `AIRPIPE_ALLOWED_ORIGINS=${input.allowedOrigins}`,
        `AIRPIPE_RATE_LIMIT_PER_MIN=${input.rateLimitPerMin}`,
        `AIRPIPE_LOG_FORMAT=json`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
    },
  });

  return { services };
}
