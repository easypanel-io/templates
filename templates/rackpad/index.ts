import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secretKey = randomString(64);

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
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
      env: [
        `NODE_ENV=production`,
        `HOST=0.0.0.0`,
        `PORT=3000`,
        `DATABASE_PATH=/data/rackpad.db`,
        `APP_URL=https://$(PRIMARY_DOMAIN)`,
        `TRUST_PROXY=1`,
        `RACKPAD_SECRET_KEY=${secretKey}`,
      ].join("\n"),
    },
  });

  return { services };
}
