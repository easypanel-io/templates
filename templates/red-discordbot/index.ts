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
      env: [
        `TOKEN=${input.discordToken}`,
        `PREFIX=${input.discordPrefix}`,
        `TZ=${input.timeZone}`,
        `PUID=1000`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "red-data",
          mountPath: "/data",
        },
      ],
    },
  });

  return { services };
}
