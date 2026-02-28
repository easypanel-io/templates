import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const env = [
    `PUID=0`,
    `PGID=0`,
    `TZ=Etc/UTC`,
    `PASSWORD=${input.password || randomPassword()}`,
    `CUSTOM_RESULTS=${input.customResults}`,
    `IPINFO_APIKEY=${input.ipinfoApiKey || ""}`,
  ];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: env.join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
        },
      ],
    },
  });

  return { services };
}
