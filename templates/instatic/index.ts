import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const crypto = require("crypto");
  const secretKey = crypto.randomBytes(32).toString("base64");

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `PORT=3001`,
        `DATABASE_URL=sqlite:/app/storage/data/cms.db`,
        `UPLOADS_DIR=/app/storage/uploads`,
        `PUBLIC_ORIGIN=https://$(PRIMARY_DOMAIN)`,
        `INSTATIC_SECRET_KEY=${secretKey}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3001,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "storage",
          mountPath: "/app/storage",
        },
      ],
    },
  });

  return { services };
}
