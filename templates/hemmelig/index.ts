import { Output, Services, randomString } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const betterAuthSecret = randomString(32);

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
          port: 3000,
        },
      ],
      env: [
        `NODE_ENV=production`,
        `DATABASE_URL=file:/app/database/hemmelig.db`,
        `BETTER_AUTH_SECRET=${betterAuthSecret}`,
        `BETTER_AUTH_URL=https://$(PRIMARY_DOMAIN)`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "hemmelig-database",
          mountPath: "/app/database",
        },
        {
          type: "volume",
          name: "hemmelig-uploads",
          mountPath: "/app/uploads",
        },
      ],
    },
  });

  return { services };
}
