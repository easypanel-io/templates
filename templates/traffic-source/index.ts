import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const jwtSecret = randomString(64);
  const cronSecret = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "github",
        owner: "mddanishyusuf",
        repo: "traffic-source",
        ref: "main",
        path: "/",
        autoDeploy: false,
      },
      build: {
        type: "nixpacks",
      },
      env: [
        `JWT_SECRET=${jwtSecret}`,
        `JWT_EXPIRY=${input.jwtExpiry || "7d"}`,
        `NEXT_PUBLIC_APP_URL=https://$(PRIMARY_DOMAIN)`,
        `DATABASE_PATH=/app/data/analytics.db`,
        `CRON_SECRET=${cronSecret}`,
      ].join("\n"),
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
          mountPath: "/app/data",
        },
      ],
    },
  });

  return { services };
}
