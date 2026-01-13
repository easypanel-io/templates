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
          port: 8000,
        },
      ],
      env: [
        `POLLING_INTERVAL=${input.pollingInterval || "60"}`,
        `SERVER_URL=https://$(PRIMARY_DOMAIN)`,
        `DATABASE_URL=sqlite:///app/db/podcast.db`,
        `RUST_BACKTRACE=1`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "podcasts",
          mountPath: "/app/podcasts",
        },
        {
          type: "volume",
          name: "db",
          mountPath: "/app/db",
        },
      ],
    },
  });

  return { services };
}
