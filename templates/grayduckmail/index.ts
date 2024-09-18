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
        `RATE_LIMIT_PER_ROUND_COUNT=20`,
        `RATE_LIMIT_ROUND_WAIT_TIME=00:05:00`,
        `FETCH_TIME=00:05:00`,
        `LOG_LEVEL=info`,
        `MIN_SEARCH_SCORE=0.2`,
        `WEB_ONLY=0`,
        `WEB_UNSUBSCRIBE=1`,
        `WEB_USE_HTTPS=1`,
        `WEB_EXTERNAL_URL=$(PRIMARY_DOMAIN)`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/database",
        },
      ],
    },
  });

  return { services };
}
