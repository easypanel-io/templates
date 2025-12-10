import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 24488 }],
      env: [
        `TITLE=${input.alltubeTitle}`,
        `CONVERT=${input.alltubeConvert}`,
        `STREAM=${input.alltubeStream}`,
        `REMUX=${input.alltubeRemux}`,
      ].join("\n"),
    },
  });

  return { services };
}
