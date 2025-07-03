import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const appKey = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `PUID=1000`,
        `PGID=1000`,
        `APP_KEY=${appKey}`,
        `DB_CONNECTION=sqlite`,
      ].join("\n"),
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
      mounts: [
        {
          type: "volume",
          name: "speedtest-config",
          mountPath: "/config",
        },
        {
          type: "volume",
          name: "speedtest-keys",
          mountPath: "/config/keys",
        },
      ],
    },
  });

  return { services };
}
