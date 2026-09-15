import { Output, Services, randomString } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 3000 }],
      env: [
        `NODE_ENV=production`,
        `PORT=3000`,
        `ENCRYPTION_KEY=${randomString(32)}`,
        `TZ=${input.timezone}`,
        `LOG_LEVEL=info`,
        `TRUST_PROXY=1`,
        `ADMIN_EMAIL=${input.adminEmail}`,
        `ADMIN_PASSWORD=${input.adminPassword}`,
      ].join("\n"),
      mounts: [
        { type: "volume", name: "data", mountPath: "/app/data" },
        { type: "volume", name: "uploads", mountPath: "/app/uploads" },
      ],
    },
  });

  return { services };
}
