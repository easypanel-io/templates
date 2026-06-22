import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mfaKey = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      env: [
        `TZ=${input.timezone || "UTC"}`,
        `PUID=1000`,
        `PGID=1000`,
        `PORT=8000`,
        `MFA_ENCRYPTION_KEY=${mfaKey}`,
      ].join("\n"),
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 8000 }],
      mounts: [
        { type: "volume", name: "data", mountPath: "/app/data" },
        { type: "volume", name: "logs", mountPath: "/app/logs" },
      ],
    },
  });

  return { services };
}
