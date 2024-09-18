import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 51515 }],
      deploy: {
        command: `/bin/kopia server start --insecure --address=0.0.0.0:51515`,
      },
      env: [
        `USER=${input.kopiaUsername}`,
        `KOPIA_SERVER_USERNAME=${input.kopiaUsername}`,
        `KOPIA_SERVER_PASSWORD=${input.kopiaPassword}`,
        `KOPIA_PASSWORD=${input.kopiaPassword}`,
      ].join("\n"),
      mounts: [
        { type: "volume", name: "config", mountPath: "/app/config" },
        { type: "volume", name: "cache", mountPath: "/app/cache" },
        { type: "volume", name: "logs", mountPath: "/app/logs" },
        { type: "volume", name: "data", mountPath: "/data" },
        { type: "volume", name: "repository", mountPath: "/repository" },
        { type: "volume", name: "tmp", mountPath: "/tmp" },
      ],
    },
  });

  return { services };
}
